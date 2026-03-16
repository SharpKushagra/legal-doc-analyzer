
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableMap
from models.llm import get_llm

def get_rag_summary_chain():
    prompt_template = """
    You are a meticulous legal analyst powered by an advanced AI. 
    Analyze the provided legal context and produce a structured, professional summary in strict markdown format.

    ---
    ### 🛡️ **Case Overview**
    - **Parties Involved**: [Identify Plaintiff vs Defendant]
    - **Court & Jurisdiction**: [Court Name, Date, Judge if available]
    
    ### ⚖️ **Legal Analysis**
    - **Key Issues**: [Bulleted list of main legal questions]
    - **Verdict/Holding**: [Clear statement of the outcome]
    - **Reasoning**: [Brief explanation of why the court decided this way]

    ### 📝 **Plain English Summary**
    [A 2-3 sentence explanation for a non-lawyer]
    ---

    If specific details are missing, state "Not specified" clearly. Do not hallucinate.

    Context:
    {context}

    Question/Focus:
    {query}
    """

    prompt = PromptTemplate(
        input_variables=["context", "query"],
        template=prompt_template,
    )

    # Use a lower temperature for factual summary
    llm = get_llm(temperature=0.1)

    chain = (
        RunnableMap({
            "context": lambda inputs: inputs["context"],
            "query": lambda inputs: inputs["query"]
        })
        | prompt
        | llm
    )

    return chain
