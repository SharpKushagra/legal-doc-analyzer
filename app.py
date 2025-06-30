import streamlit as st
from utils.pdf_loader import extract_text_from_pdf
from chains.case_summary_chain import get_case_summary_chain

st.set_page_config(page_title="Legal Case Analyzer", layout="centered")
st.title("📚 Legal Document Analyzer & Case Summary Generator")

uploaded_file = st.file_uploader("Upload a legal case PDF", type="pdf")

if uploaded_file:
    text = extract_text_from_pdf(uploaded_file)
    st.subheader("📄 Extracted Text Preview:")
    st.write(text[:1000] + "..." if len(text) > 1000 else text)

    with st.spinner("Analyzing document..."):
        chain = get_case_summary_chain()
        result = chain.run(document=text)
        st.subheader("🧾 Case Summary:")
        st.write(result)
