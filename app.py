import streamlit as st
import tempfile
from utils.pdf_loader import extract_text_from_pdf, extract_metadata
from utils.highlight import highlight_keywords
from retriever.vector_store import create_vector_store_and_retriever
from chains.rag_summary_chain import get_rag_summary_chain

# --- Page Config ---
st.set_page_config(page_title="Legal Case Analyzer", layout="wide")

# --- Sidebar Navigation ---
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
                summary = response if isinstance(response, str) else response.get("result", "No summary generated.")
            except Exception as e:
                st.error(f"❌ Failed to generate summary for `{uploaded_file.name}`: {e}")
                continue

        # --- Metadata Extraction ---
        metadata = extract_metadata(extracted_text)

        # --- Layout ---
        col1, col2 = st.columns([2, 1])

        with col1:
            with st.expander("📝 Extracted Text Preview", expanded=True):
                st.code(extracted_text, language="text")

        with col2:
            with st.expander("📌 Case Metadata", expanded=True):
                for key, value in metadata.items():
                    st.markdown(f"**{key}**: {value}")

            with st.expander("📥 Download Options", expanded=True):
                st.download_button("⬇ Download Extracted Text", extracted_text, file_name=f"{uploaded_file.name}_extracted.txt")
                st.download_button("⬇ Download Case Summary", summary, file_name=f"{uploaded_file.name}_summary.txt")

        # --- Summary Output ---
        with st.expander("🧠 Case Summary", expanded=True):
            highlighted_summary = highlight_keywords(summary)
            st.markdown(highlighted_summary, unsafe_allow_html=True)
