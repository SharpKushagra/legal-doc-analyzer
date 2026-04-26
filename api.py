
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
import shutil
import uuid
import os
import logging
import re
import json
import io
from typing import Dict, Any, List, Literal
from pydantic import BaseModel, EmailStr, Field
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from sqlalchemy.orm import Session

# --- Database & Auth ---
from database import get_db, init_db
from models_db import User, Analysis
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

# --- Enhanced Logic ---
from utils.pdf_loader import extract_text_from_pdf, extract_metadata
from retriever.vector_store import create_vector_store_and_retriever
from chains.rag_summary_chain import get_rag_summary_chain
from chains.risk_assessment import get_risk_analysis_chain
from models.llm import get_llm

# Initialize Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Legal Doc Analyzer API (Powered by Groq)")


@app.on_event("startup")
def startup():
    init_db()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for simplicity/demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper: Resilient Metadata Extraction ---
def _fallback_extract_metadata(text: str) -> dict:
    """Regex-based metadata extraction as a fast fallback."""
    md = {}
    
    # Dates
    date_patterns = [
        r"\b(\d{4})\.\s*([A-Z][a-z]+)\s+(\d{1,2})\.?\b",
        r"\b([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})\b",
        r"\b(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})\b",
    ]
    for p in date_patterns:
        m = re.search(p, text)
        if m:
            parts = m.groups()
            if len(parts) == 3:
                try: 
                    if len(parts[0]) == 4: md["Date"] = f"{parts[2]} {parts[1]} {parts[0]}"
                    elif len(parts[2]) == 4: md["Date"] = f"{parts[1]} {parts[0]} {parts[2]}"
                except: pass
                break
    
    # Judge
    judge_patterns = [
        r"delivered\s+by\s+([A-Z][A-Z\s\.\-]*,\s*J\.)",
        r"\b([A-Z][A-Z\s\.\-]*,\s*J\.)",
        r"\bJustice\s+([A-Z][a-zA-Z\.\s\-]+)\b",
    ]
    for p in judge_patterns:
        m = re.search(p, text, flags=re.IGNORECASE)
        if m:
            md["Judge"] = m.group(1).title() if m.group(1).isupper() else m.group(1).strip()
            break
            
    # Court
    court_patterns = [
        r"\bSupreme Court of India\b",
        r"\bHigh Court of [A-Z][a-zA-Z ]+\b",
        r"\bPatna High Court\b",
    ]
    for p in court_patterns:
        m = re.search(p, text)
        if m:
            md["Court"] = m.group(0).strip()
            break
    return md

def get_resilient_metadata(text: str) -> dict:
    base = extract_metadata(text) or {}
    fallback = _fallback_extract_metadata(text)
    for k, v in fallback.items():
        if k not in base or not str(base[k]).strip():
            base[k] = v
    return base

# --- API Models ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class AnalyzeResponse(BaseModel):
    id: str
    filename: str
    status: str
    message: str


class AnalysisResult(BaseModel):
    id: str
    filename: str
    text: str
    metadata: Dict[str, Any]
    summary: Any
    risk_score: int
    risks: List[Dict[str, Any]]
    created_at: str | None = None


LEGAL_ASSISTANT_SYSTEM = """You are the in-app legal assistant for Clause Sense. Your role is to help users understand legal concepts, contract terms, litigation basics, compliance topics, and how to think about their uploaded documents at a general level.

Rules:
- Only engage with legal or legal-adjacent questions (contracts, courts, statutes, liability, IP, employment law, privacy, dispute resolution, legal definitions, due diligence checklists, etc.).
- If the user asks something clearly unrelated to law (games, coding, recipes, personal chit-chat, math homework), politely refuse and invite them to ask a legal question instead. Do not answer the off-topic request.
- You are not a licensed attorney. Do not give definitive "you must" instructions for their specific case. Give educational information and recommend consulting qualified local counsel for matters that depend on jurisdiction or specific facts.
- Be concise unless the user asks for detail. Use plain language where possible."""


class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class LegalChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    history: List[ChatHistoryItem] = Field(default_factory=list)


class LegalChatResponse(BaseModel):
    reply: str


# --- Auth Endpoints ---
@app.post("/api/auth/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "full_name": user.full_name},
    )


@app.post("/api/auth/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(data={"sub": user.id})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "full_name": user.full_name},
    )


# --- Protected Endpoints ---
@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # 1. Save File Temporarily
        file_id = str(uuid.uuid4())
        # Use simple temp name to avoid Windows permission issues with NamedTemporaryFile
        tmp_path = f"temp_{file_id}_{file.filename}"
        
        with open(tmp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 2. Extract Text
        logger.info(f"Extracting text for {file.filename}...")
        try:
            extracted_text = extract_text_from_pdf(tmp_path)
        finally:
            # Cleanup immediately
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from PDF")

        # 3. Create Vector Store (RAG)
        logger.info("Creating vector store for RAG...")
        retriever = create_vector_store_and_retriever(extracted_text)
        
        # 4. Generate Summary (using Groq)
        logger.info("Generating summary with Groq Llama 3...")
        
        summary_query = (
            "Summarize this legal document or case. Identify the parties, court/jurisdiction, "
            "key legal issues, and the final verdict/judgment. Provide a plain English summary at the end."
        )
        
        # We retrieve context for the summary
        docs = retriever.invoke(summary_query)
        context_text = "\n\n".join([doc.page_content for doc in docs])
        
        summary_chain = get_rag_summary_chain()
        summary_res = summary_chain.invoke({
            "context": context_text,
            "query": summary_query
        })
        
        # If the result is a dict (from older chains), extract text; otherwise it's a string
        # Groq chain likely returns a string or AIMessage
        if hasattr(summary_res, 'content'):
            summary_content = summary_res.content
        elif isinstance(summary_res, dict):
            summary_content = summary_res.get("text", str(summary_res))
        else:
            summary_content = str(summary_res)

        # 5. Risk Analysis (using Groq)
        logger.info("Analyzing risks with Groq Llama 3...")
        risk_chain = get_risk_analysis_chain()
        
        # Retrieve context relevant to risks
        risk_query = "indemnification termination confidentiality liability dispute resolution"
        risk_docs = retriever.invoke(risk_query)
        risk_context = "\n\n".join([doc.page_content for doc in risk_docs])
        
        # If context is too short, append more from summary context
        if len(risk_context) < 500:
            risk_context += "\n" + context_text
            
        try:
            risk_data = risk_chain.invoke(risk_context)
            # Ensure we have the right keys
            if isinstance(risk_data, dict):
                risks = risk_data.get("risks", [])
                risk_score = risk_data.get("risk_score", 50)
            else:
                # Fallback if JSON parsing somehow failed but chain returned something
                logger.warning(f"Unexpected risk data format: {risk_data}")
                risks = []
                risk_score = 50
        except Exception as e:
            logger.error(f"Risk analysis failed: {e}")
            risks = [{
                "title": "Analysis Error",
                "severity": "Unknown",
                "description": "Could not complete AI risk analysis.",
                "impact": "Manual review recommended."
            }]
            risk_score = 50

        # 6. Metadata
        metadata = get_resilient_metadata(extracted_text)

        # Store in DB (user-scoped)
        analysis = Analysis(
            id=file_id,
            user_id=current_user.id,
            filename=file.filename,
            text=extracted_text[:5000],
            metadata_=metadata,
            summary=summary_content,
            risk_score=risk_score,
            risks=risks,
        )
        db.add(analysis)
        db.commit()

        return {
            "id": file_id,
            "filename": file.filename,
            "status": "success",
            "message": "Analysis complete",
        }

    except Exception as e:
        logger.error(f"Error processing {file.filename}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


def _analysis_to_result(a: Analysis) -> dict:
    return {
        "id": a.id,
        "filename": a.filename,
        "text": a.text or "",
        "metadata": a.metadata_ or {},
        "summary": a.summary,
        "risk_score": a.risk_score or 0,
        "risks": a.risks or [],
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@app.get("/api/analysis/{analysis_id}", response_model=AnalysisResult)
def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _analysis_to_result(analysis)


@app.get("/api/analyses")
def get_all_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return current user's analysis results for dashboard."""
    rows = db.query(Analysis).filter(Analysis.user_id == current_user.id).order_by(Analysis.created_at.desc()).all()
    results = [_analysis_to_result(r) for r in rows]
    return {
        "results": results,
        "stats": {
            "total": len(results),
            "avg_risk": sum(r["risk_score"] for r in results) / len(results) if results else 0,
            "critical": sum(1 for r in results if r["risk_score"] > 80),
        },
    }


@app.post("/api/legal-chat", response_model=LegalChatResponse)
def legal_chat(
    body: LegalChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Legal Q&A using the same Groq-backed LLM configuration as document analysis (server GROQ_API_KEY).
    """
    _ = current_user  # require auth; no per-user model key
    text = body.message.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        llm = get_llm(model_name="llama-3.3-70b-versatile", temperature=0.2)
    except ValueError as e:
        logger.warning("Legal chat unavailable: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Legal assistant is not configured (missing GROQ_API_KEY on the server).",
        )

    lc_messages: List[BaseMessage] = [SystemMessage(content=LEGAL_ASSISTANT_SYSTEM)]
    for item in body.history[-24:]:
        if item.role == "user":
            lc_messages.append(HumanMessage(content=item.content))
        elif item.role == "assistant":
            lc_messages.append(AIMessage(content=item.content))
    lc_messages.append(HumanMessage(content=text))

    try:
        out = llm.invoke(lc_messages)
        reply = out.content if hasattr(out, "content") else str(out)
        if not reply or not str(reply).strip():
            reply = "I could not generate a response. Please try rephrasing your legal question."
    except Exception as e:
        logger.error("legal_chat invoke failed: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Assistant request failed. Please try again.")

    return LegalChatResponse(reply=str(reply).strip())


@app.get("/api/analysis/{analysis_id}/download")
def download_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download analyzed document as a text report (summary + risks + metadata)."""
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == current_user.id,
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Build report content
    lines = [
        f"# Legal Document Analysis Report",
        f"# {analysis.filename}",
        "",
        "## Metadata",
    ]
    for k, v in (analysis.metadata_ or {}).items():
        lines.append(f"- **{k}**: {v}")
    lines.extend(["", "## Executive Summary", "", analysis.summary or "N/A", ""])
    lines.append("## Identified Risks")
    for r in (analysis.risks or []):
        lines.append(f"- **{r.get('title', 'Risk')}** ({r.get('severity', 'N/A')})")
        lines.append(f"  {r.get('description', '')}")
        if r.get("impact"):
            lines.append(f"  Impact: {r['impact']}")
        lines.append("")
    lines.append(f"---\nRisk Score: {analysis.risk_score}%")
    content = "\n".join(lines)
    filename = (analysis.filename or "document").rsplit(".", 1)[0] + "_analysis_report.txt"

    return Response(
        content=content.encode("utf-8"),
        media_type="text/plain; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "provider": "Groq Llama 3"}

if __name__ == "__main__":
    import uvicorn
    # Use standard port 8000 for local dev
    uvicorn.run(app, host="0.0.0.0", port=8000)
