from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableMap
from models.ollama_llm import get_llm

def get_rag_summary_chain():
    prompt_template = """
You are a legal expert AI summarizer. Based on the following legal context, generate a clear, structured case summary with markdown formatting. Your response must follow this format:

---

- 🧑‍⚖️ **Parties Involved**: ...
- 🏛️ **Court Name & Jurisdiction**: ...
- 📌 **Legal Issues Discussed**: ...
- ⚖️ **Final Verdict or Judgment**: ...
- 🗣️ **Plain English Summary**: ...

---

If any information is not available, write "Not specified" for that section.

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
