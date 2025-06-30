from langchain_community.llms import Ollama

def get_llm(model_name="mistral"):
    return Ollama(model=model_name)
