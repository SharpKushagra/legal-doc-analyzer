
import os
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

def get_llm(model_name="llama-3.3-70b-versatile", temperature=0):
    """
    Returns a highly efficient Groq LLM instance.
    Uses Llama 3 70B for maximum reasoning capability at super fast speeds.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
        
    return ChatGroq(
        model_name=model_name,
        temperature=temperature,
        groq_api_key=api_key
    )
