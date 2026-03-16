import re
from io import BytesIO
from PyPDF2 import PdfReader
from pdf2image import convert_from_bytes
import pytesseract

# Modify this path if poppler is installed elsewhere
POPPER_PATH = r"C:\poppler\Library\bin"  # Update this if needed


def extract_text_from_pdf(file):
    try:
        # If `file` is a string path
        if isinstance(file, str):
            with open(file, "rb") as f:
                file_bytes = f.read()
        # If it's an uploaded file from Streamlit or FastAPI
        elif hasattr(file, "read"):
            file_bytes = file.read()
        # If it's already bytes
        elif isinstance(file, bytes):
            file_bytes = file
        else:
            raise TypeError("Unsupported file type for extraction")

        # Ensure it's wrapped in BytesIO
        file_obj = BytesIO(file_bytes)

        # Attempt PyPDF2 extraction
        print("[INFO] Starting PDF text extraction...")
        reader = PdfReader(file_obj)
        extracted_text = " ".join(
            [page.extract_text() for page in reader.pages if page.extract_text()]
        )

        if extracted_text.strip():
            return extracted_text
        else:
            print("[INFO] No text found, falling back to OCR extraction...")

    except Exception as e:
        print(f"[❌ ERROR] PyPDF2 extraction failed: {e}")
        print("[🔁] Falling back to OCR extraction...")

    # OCR fallback
    try:
        images = convert_from_bytes(file_bytes, poppler_path=POPPER_PATH)
        ocr_text = ""
        for i, img in enumerate(images):
            text = pytesseract.image_to_string(img)
            print(f"[INFO] OCR Page {i+1} extracted")
            ocr_text += text + "\n"

        return ocr_text.strip()

    except Exception as e:
        print(f"[❌ ERROR] OCR extraction failed: {e}")
        return ""


def extract_metadata(text):
    metadata = {}

    # Extract case number
    case_number_match = re.search(r'Case\s*[:-]?\s*(.*?)[\n\r]', text, re.IGNORECASE)
    if case_number_match:
        metadata["Case Number"] = case_number_match.group(1).strip()

    # Extract court name
    court_match = re.search(r'(?i)(IN THE .*?COURT.*?)\n', text)
    if court_match:
        metadata["Court"] = court_match.group(1).strip()

    # Extract date
    date_match = re.search(r'Date[:\-]?\s*(\w+\s\d{1,2},\s\d{4})', text)
    if date_match:
        metadata["Date"] = date_match.group(1).strip()

    # Extract judge name
    judge_match = re.search(r'(Justice.*)', text)
    if judge_match:
        metadata["Judge"] = judge_match.group(1).strip("()")

    return metadata
