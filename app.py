import sys
import re
import streamlit as st
import tempfile
from utils.pdf_loader import extract_text_from_pdf, extract_metadata
from utils.highlight import highlight_keywords
from retriever.vector_store import create_vector_store_and_retriever
from chains.rag_summary_chain import get_rag_summary_chain


# ---------- Helpers: resilient metadata extraction ----------
def _fallback_extract_metadata(text: str) -> dict:
    """
    Fallback extractor for common Indian case layouts.
    Targets examples like:
      • "1962. February 22."  (Year. Month Day.)
      • "February 22, 1962"
      • "delivered by AYYANGAR, J."
      • "Justice K. Subba Rao"
    """
    md = {}

    # --- Date patterns ---
    date_patterns = [
        # "1962. February 22." or "1962. February 22"
        r"\b(\d{4})\.\s*([A-Z][a-z]+)\s+(\d{1,2})\.?\b",
        # "February 22, 1962" or "February 22 1962"
        r"\b([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})\b",
        # "22 February 1962"
        r"\b(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})\b",
    ]
    for p in date_patterns:
        m = re.search(p, text)
        if m:
            # Normalize to "22 February 1962"
            parts = m.groups()
            if len(parts) == 3:
                # Try to detect which group is the year/month/day
                # Pattern 1: (year, Month, day)
                if len(parts[0]) == 4 and parts[0].isdigit():
                    y, mon, d = parts[0], parts[1], parts[2]
                    md["Date"] = f"{d} {mon} {y}"
                    break
                # Pattern 2: (Month, day, year)
                if len(parts[2]) == 4 and parts[2].isdigit():
                    mon, d, y = parts[0], parts[1], parts[2]
                    md["Date"] = f"{d} {mon} {y}"
                    break
                # Pattern 3: (day, Month, year)
                if len(parts[2]) == 4 and parts[2].isdigit():
                    d, mon, y = parts[0], parts[1], parts[2]
                    md["Date"] = f"{d} {mon} {y}"
                    break

    # --- Judge patterns ---
    # Examples: "delivered by AYYANGAR, J." / "AYYANGAR, J." / "Justice P. B. Gajendragadkar"
    judge_patterns = [
        r"delivered\s+by\s+([A-Z][A-Z\s\.\-]*,\s*J\.)",           # delivered by AYYANGAR, J.
        r"\b([A-Z][A-Z\s\.\-]*,\s*J\.)",                           # AYYANGAR, J.
        r"\bJustice\s+([A-Z][a-zA-Z\.\s\-]+)\b",                   # Justice K. Subba Rao
    ]
    for p in judge_patterns:
        m = re.search(p, text, flags=re.IGNORECASE)
        if m:
            name = m.group(1).strip()
            # Normalize "AYYANGAR, J." → "Ayyangar, J."
            if name.isupper():
                name = name.title()
            md["Judge"] = name
            break

    # --- Court (very light heuristic, optional) ---
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
    """
    Try the existing extractor first (utils.pdf_loader.extract_metadata).
    If it returns empty/partial, fill with fallback fields.
    """
    base = extract_metadata(text) or {}
    fallback = _fallback_extract_metadata(text)

    # Merge without overwriting anything the base already found
    for k, v in fallback.items():
        if k not in base or not str(base[k]).strip():
            base[k] = v
    return base


# ✅ Debug: Show Python path being used
st.text(f"✅ Running Python from: {sys.executable}")

# --- Page Config ---
st.set_page_config(page_title="Legal Case Analyzer", layout="wide")

# --- Sidebar Navigation ---
with st.sidebar:
    st.markdown("## 🌟 Navigation")
    st.markdown("1. [Upload PDF(s)](#upload-one-or-more-legal-case-pdfs)")
    st.markdown("2. [Extracted Text](#extracted-text-preview)")
    st.markdown("3. [Case Summary](#case-summary)")
    st.markdown("4. [Download](#download-options)")
    st.markdown("---")
    st.markdown("📌 Built with ❤️ using Streamlit")

# --- Title ---
st.markdown("## 🧾 Legal Document Analyzer & Case Summary Generator")

# --- File Uploader (Multi-support) ---
uploaded_files = st.file_uploader(
    "📤 Upload one or more legal case PDFs",
    type="pdf",
    accept_multiple_files=True
)

# --- Process Each Uploaded File ---
if uploaded_files:
    for uploaded_file in uploaded_files:
        st.markdown(f"---\n\n### 🗂️ Processing File: `{uploaded_file.name}`")

        # --- Save to Temp File ---
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(uploaded_file.read())
            tmp_file_path = tmp_file.name

        # --- Extract Text ---
        try:
            extracted_text = extract_text_from_pdf(tmp_file_path)
        except Exception as e:
            st.error(f"❌ Failed to extract text from `{uploaded_file.name}`: {e}")
            continue

        if not extracted_text.strip():
            st.warning(f"⚠️ No text extracted from `{uploaded_file.name}`.")
            continue

        with st.spinner("🔍 Analyzing document using RAG..."):
            try:
                # Step 1: Create Retriever & Get Context
                retriever = create_vector_store_and_retriever(extracted_text)
                docs = retriever.invoke("Summarize this legal case")
                context = "\n\n".join([doc.page_content for doc in docs])

                # Step 2: Get RAG Summary
                summary_chain = get_rag_summary_chain()
                response = summary_chain.invoke({
                    "context": context,
                    "query": "Summarize this legal case"
                })

                # Step 3: Extract Final Summary
                if hasattr(response, 'content'):
                    summary = response.content
                elif isinstance(response, dict):
                    summary = response.get("result", response.get("text", str(response)))
                else:
                    summary = str(response)
            except Exception as e:
                st.error(f"❌ Failed to generate summary for `{uploaded_file.name}`: {e}")
                continue

        # --- Metadata Extraction (resilient) ---
        metadata = get_resilient_metadata(extracted_text)

        # --- Layout ---
        col1, col2 = st.columns([2, 1])

        with col1:
            with st.expander("📝 Extracted Text Preview", expanded=True):
                st.code(extracted_text, language="text")

        with col2:
            with st.expander("📌 Case Metadata", expanded=True):
                if metadata:
                    for key, value in metadata.items():
                        st.markdown(f"**{key}**: {value}")
                else:
                    st.info("No metadata detected. Try a different PDF or adjust patterns.")

            with st.expander("📥 Download Options", expanded=True):
                st.download_button(
                    "⬇ Download Extracted Text",
                    extracted_text,
                    file_name=f"{uploaded_file.name}_extracted.txt"
                )
                st.download_button(
                    "⬇ Download Case Summary",
                    summary,
                    file_name=f"{uploaded_file.name}_summary.txt"
                )

        # --- Case Summary Output ---
        with st.expander("🧠 Case Summary", expanded=True):
            highlighted_summary = highlight_keywords(summary)
            st.markdown(highlighted_summary, unsafe_allow_html=True)
