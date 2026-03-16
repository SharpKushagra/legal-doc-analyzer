
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableMap
from models.llm import get_llm
from langchain_core.output_parsers import JsonOutputParser

def get_risk_analysis_chain():
    """
    Returns a chain that analyzes legal text/context for risks and outputs JSON.
    """
    parser = JsonOutputParser()
    
    prompt_template = """
    You are a Senior Legal Risk Assessor. Your job is to identify potential risks in a legal document based on the provided context.
    
    Analyze the text for the following specific risks:
    1. **Missing Indemnification** (High Risk if missing)
    2. **Strict Termination Clauses** (Medium/High Risk if unfair)
    3. **Lack of Confidentiality/NDA** (Critical Risk if missing)
    4. **Unlimited Liability** (High Risk)
    5. **Dispute Resolution** (Check for Arbitration vs Court)
    
    Return the output STRICTLY as a JSON object with a key "risks" containing a list of objects.
    Each object must have:
    - "title": Short title of the risk
    - "severity": "Critical", "High", "Medium", or "Low"
    - "description": Brief explanation of the risk found (or not found)
    - "impact": The potential negative consequence for the client.
    - "score": A numerical score 0-100 (where 100 is safe, 0 is dangerous). Wait, let's use a "risk_score" for the document.
    
    Actually, return a JSON with:
    - "risk_score": integer (0 to 100, where 100 is High Risk, 0 is Low Risk).
    - "risks": list of risk objects.

    If no major risks are found, return a low risk score and empty/positive list.
    
    Document Context:
    {context}
    
    {format_instructions}
    """
    
    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["context"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    
    # Use Llama 3 70B for high intelligence reasoning
    llm = get_llm(model_name="llama-3.3-70b-versatile", temperature=0.2)
    
    chain = (
        {"context": RunnablePassthrough()}
        | prompt
        | llm
        | parser
    )
    
    return chain
