from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from models.ollama_llm import get_llm

def get_case_summary_chain():
    prompt = PromptTemplate.from_template("""
You are a legal assistant. Analyze the following legal text and extract:
1. Parties Involved
2. Court Name and Jurisdiction
3. Legal Issue
4. Verdict
5. A Summary in plain English

Legal Text:
{document}
""")
    llm = get_llm()
    return LLMChain(prompt=prompt, llm=llm)
