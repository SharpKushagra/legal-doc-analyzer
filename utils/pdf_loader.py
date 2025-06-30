from PyPDF2 import PdfReader
import re

def extract_text_from_pdf(file):
    reader = PdfReader(file)
    return " ".join([page.extract_text() for page in reader.pages if page.extract_text()])


def extract_metadata(text):
    metadata = {}

    # Extract case number
    case_number_match = re.search(r'(?i)(CIVIL\s+APPEAL\s+NO\.?\s+\d+\/?\d*)', text)
    if case_number_match:
        metadata["Case Number"] = case_number_match.group(1).strip()

    # Extract court name
    court_match = re.search(r'(?i)(IN THE .*?COURT.*?)\n', text)
    if court_match:
        metadata["Court"] = court_match.group(1).strip()

    # Extract date
    date_match = re.search(r'Date[:\-]?\s*(\w+\s\d{1,2},\s*\d{4})', text)
    if date_match:
        metadata["Date"] = date_match.group(1).strip()

    # Extract judge name
    judge_match = re.search(r'\(Justice.*?\)', text)
    if judge_match:
        metadata["Judge"] = judge_match.group(0).strip("()")

    return metadata