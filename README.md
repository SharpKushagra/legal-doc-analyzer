# Legal Document Analyzer

Upload a court case PDF and get:
- Parties Involved
- Court Info
- Legal Issue
- Verdict
- Summary (in simple English)

🔧 Powered by LangChain + Free Local LLM (Ollama).


here are some steps which are required to be done -

1.Create virtual Environment 
python -m venv venv
source venv/bin/activate        # On macOS/Linux
venv\Scripts\activate           # On Windows


2.install all dependencies which can be found in requiremnts.txt 


# Streamlit App
streamlit>=1.30.0

# PDF Text Extraction
PyMuPDF==1.23.10

# LangChain Core
langchain>=0.2.0
langchain-core>=0.1.45
langchain-community>=0.2.0
langchain-ollama>=0.1.0
langchain-huggingface>=0.0.1

# Embeddings & Vector Store
chromadb==0.4.24
sentence-transformers==2.2.2

# LLM and RAG Model
ollama>=0.1.0

# Utility
tqdm
```

---

## Current stack (Next.js + FastAPI + PostgreSQL)

- **Frontend**: Next.js (see `frontend/`) — login, signup, dashboard, document list, download reports.
- **Backend**: FastAPI (`api.py`) — auth (JWT), analyze PDFs, store analyses in PostgreSQL.
- **Database**: PostgreSQL for users and analyses.

### Backend setup

1. Create a PostgreSQL database, e.g. `legaldoc`.
2. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL=postgresql://user:password@localhost:5432/legaldoc`
   - `JWT_SECRET=<generate with: openssl rand -hex 32>`
3. Install deps: `pip install -r requirements.txt`
4. Run API: `python api.py` (creates tables on startup; serves on http://localhost:8000).

### Frontend setup

1. `cd frontend && npm install && npm run dev` — app at http://localhost:3000.
2. Sign up or sign in, then upload PDFs and download analysis reports from the dashboard or My Documents.
