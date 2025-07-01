from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableMap, RunnablePassthrough
from models.ollama_llm import get_llm

def get_rag_summary_chain():
    prompt_template = """You are a legal expert AI tasked with summarizing Indian court case judgments.
Use the provided context from the legal document to generate a concise summary, including:
- Parties involved
- Court name and jurisdiction
- Legal issue
- Verdict
- Summary in plain English

If the context is unclear or missing critical information, say "Insufficient information."

Context:
{context}

Question:
{query}
"""

    prompt = PromptTemplate(
        input_variables=["context", "query"],
        template=prompt_template,
    )

    llm = get_llm()

    chain = (
        RunnableMap({
            "context": lambda inputs: inputs["context"],
            "query": lambda inputs: inputs["query"]
        })
        | prompt
        | llm
    )

    return chain
