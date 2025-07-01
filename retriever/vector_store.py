from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from retriever.embedder import get_embedding_model
from langchain.schema import Document

def create_vector_store_and_retriever(text: str):
    # Split long text into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    documents = splitter.create_documents([text])

    # Embed & store in Chroma
    embedding_model = get_embedding_model()
    vectorstore = Chroma.from_documents(documents, embedding_model)

    # Return retriever interface
    return vectorstore.as_retriever()
