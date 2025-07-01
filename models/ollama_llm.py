from langchain_ollama import OllamaLLM  # ✅ NEW correct import

def get_llm(model_name="mistral"):
    return OllamaLLM(model=model_name)
