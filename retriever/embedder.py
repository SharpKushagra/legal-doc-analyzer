# retriever/embedder.py

import logging

# Log initialization
logging.basicConfig(level=logging.INFO)

try:
    from langchain_huggingface import HuggingFaceEmbeddings
    logging.info("✅ langchain_huggingface imported successfully.")
except ImportError as e:
    logging.error("❌ Failed to import langchain_huggingface:", exc_info=True)
    raise e

try:
    from sentence_transformers import SentenceTransformer
    logging.info("✅ sentence_transformers imported successfully.")
except ImportError as e:
    logging.error("❌ Failed to import sentence_transformers:", exc_info=True)
    raise e


def get_embedding_model():
    try:
        logging.info("🔧 Initializing HuggingFaceEmbeddings with MiniLM...")
        model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        logging.info("✅ HuggingFaceEmbeddings initialized successfully.")
        return model
    except Exception as e:
        logging.error("❌ Failed to initialize HuggingFaceEmbeddings:", exc_info=True)
        raise e
