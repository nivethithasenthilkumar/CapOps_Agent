import os
from langchain_core.documents import Document
from langchain_text_splitters import CharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_anthropic import ChatAnthropic
from langchain.chains import RetrievalQA

DB_DIR = os.getenv("CHROMA_DB_PATH", "./chroma_db")
KB_DIR = os.path.join(os.path.dirname(__file__), "knowledge_base")

def init_rag():
    docs = []
    files = ["hr_policies.txt", "it_sop.txt", "finance_faq.txt", "onboarding.txt"]
    
    for f in files:
        path = os.path.join(KB_DIR, f)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as file:
                    content = file.read()
                    docs.append(Document(page_content=content, metadata={"source": path}))
            except Exception as e:
                print(f"Error loading {f}: {e}")
            
    if not docs:
        print("No documents loaded!")
        return None
        
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=DB_DIR)
    
    model_name = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
    llm = ChatAnthropic(model=model_name, temperature=0)
    
    qa_chain = RetrievalQA.from_chain_type(
        llm,
        retriever=vectorstore.as_retriever(),
        return_source_documents=True
    )
    return qa_chain

qa_chain = None

def query_kb(query: str) -> dict:
    global qa_chain
    if qa_chain is None:
        try:
            qa_chain = init_rag()
        except Exception as e:
            print(f"Failed to init RAG: {e}")
            return {"answer": "Knowledge base unavailable.", "source_doc": "None", "confidence_score": 0.0}
            
    if not qa_chain:
        return {"answer": "Knowledge base not loaded.", "source_doc": "None", "confidence_score": 0.0}
        
    try:
        res = qa_chain.invoke({"query": query})
        answer = res["result"]
        source_docs = res["source_documents"]
        
        source_doc_name = "Unknown"
        if source_docs:
            source_doc_name = os.path.basename(source_docs[0].metadata.get("source", "Unknown"))
            
        return {
            "answer": answer,
            "source_doc": source_doc_name,
            "confidence_score": 0.95 
        }
    except Exception as e:
        print(f"Query error: {e}")
        return {"answer": "An error occurred while finding the answer.", "source_doc": "None", "confidence_score": 0.0}
