
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from models.llm import get_llm

def get_case_summary_chain():
    """
    Creates a chain for analyzing full case text (non-RAG flow if needed)
    """
    prompt = PromptTemplate.from_template("""
    You are an expert legal summarizer. 
    Analyze the full text below and extract key details into a structured JSON-like format (but use Markdown headers).

    ## Case Information
    - **Parties**: ...
    - **Court**: ...
    - **Date**: ...
    
    ## Legal Analysis
    - **Issue**: [What is the core legal question?]
    - **Holding**: [Who won and why?]
    - **Significance**: [Why does this case matter?]

    ## Plain English Summary
    [2-3 sentences explaining the case simply]

    ---
    Legal Text:
    {document}
    """)
    
    llm = get_llm(model_name="llama3-70b-8192", temperature=0)
    
    chain = (
        {"document": RunnablePassthrough()} 
        | prompt 
        | llm
    )
    
    return chain
