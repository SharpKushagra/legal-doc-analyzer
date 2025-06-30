import streamlit as st
import tempfile
from utils.pdf_loader import extract_text_from_pdf, extract_metadata
from chains.case_summary_chain import get_case_summary_chain
from utils.highlight import highlight_keywords

# Page config
st.set_page_config(page_title="Legal Case Analyzer", layout="wide")

# --- Sidebar Navigation ---
with st.sidebar:
    st.markdown("## 🌟 Navigation")
    st.markdown("1. [Upload PDF](#upload-a-legal-case-pdf)")
    st.markdown("2. [Extracted Text](#extracted-text-preview)")
    st.markdown("3. [Case Metadata](#case-metadata)")
    st.markdown("4. [Case Summary](#case-summary)")
    st.markdown("5. [Download](#download-options)")
    st.markdown("---")
    st.markdown("📌 Built with ❤️ using Streamlit")

# Title
st.markdown("## 🧾 Legal Document Analyzer & Case Summary Generator")

# --- File Uploader ---
uploaded_file = st.file_uploader("📤 Upload a legal case PDF", type="pdf")

if uploaded_file:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(uploaded_file.read())
        tmp_file_path = tmp_file.name

    # --- Extract Text ---
    try:
        extracted_text = extract_text_from_pdf(tmp_file_path)
    except Exception as e:
        st.error(f"❌ Failed to extract text: {e}")
        st.stop()

    if extracted_text.strip():
        # Show uploaded file name
        st.markdown(f"📄 **{uploaded_file.name}**")

        # Spinner while analyzing
        with st.spinner("🔍 Analyzing document..."):
            # Run summary chain
            summary_chain = get_case_summary_chain()
            try:
                summary = summary_chain.run(extracted_text)
            except Exception as e:
                st.error(f"❌ Failed to generate summary: {e}")
                st.stop()

        # Extract metadata
        metadata = extract_metadata(extracted_text)

        # --- Display Layout ---
        col1, col2 = st.columns([2, 1])

        with col1:
            with st.expander("📝 Extracted Text Preview", expanded=True):
                st.code(extracted_text, language="text")

        with col2:
            with st.expander("📌 Case Metadata", expanded=True):
                for key, value in metadata.items():
                    st.markdown(f"**{key}**: {value}")

            with st.expander("📥 Download Options", expanded=True):
                st.download_button("⬇ Download Extracted Text", extracted_text, file_name="extracted_text.txt", key="download_text_btn")
                st.download_button("⬇ Download Case Summary", summary, file_name="case_summary.txt", key="download_summary_btn")

        # --- Case Summary ---
        with st.expander("🧠 Case Summary", expanded=True):
            highlighted_summary = highlight_keywords(summary)
            st.markdown(highlighted_summary, unsafe_allow_html=True)

    else:
        st.warning("⚠️ No text could be extracted from the uploaded PDF.")
