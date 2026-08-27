import logging
from typing import Any
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from supabase import create_client
from app.config import Settings

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.retriever: Any = None
        self.llm: Any = None
        self.prompt = PromptTemplate(
            template="""You are EpCraft's helpful customer-support assistant. Answer only from the supplied context. If the context does not contain the answer, say: "I don't have enough information to answer that question." Do not invent product availability, prices, delivery dates, or policies.

Conversation history:
{chat_history}

Context:
{context}

Customer question: {question}

Answer:""",
            input_variables=["context", "question", "chat_history"],
        )

    def _load_documents(self) -> list[Document]:
        documents: list[Document] = []
        if self.settings.supabase_url and self.settings.supabase_key:
            try:
                client = create_client(self.settings.supabase_url, self.settings.supabase_key)
                response = client.table("products").select("name, description").execute()
                for product in response.data or []:
                    name = product.get("name") or ""
                    description = product.get("description") or ""
                    if name or description:
                        documents.append(Document(
                            page_content=f"Product name: {name}\nDescription: {description}",
                            metadata={"source": "supabase_products", "product_name": name},
                        ))
                logger.info("Loaded %s product documents from Supabase", len(documents))
            except Exception:
                logger.exception("Supabase product loading failed; using fallback policy documents")
        if not documents:
            documents = [
                Document(page_content="Shipping policy: EpCraft offers free shipping on orders over $50. Delivery takes 3-5 business days.", metadata={"source": "shipping_policy"}),
                Document(page_content="Return policy: Items can be returned within 30 days of purchase.", metadata={"source": "return_policy"}),
            ]
        return documents

    def initialize(self) -> None:
        if not self.settings.google_api_key:
            raise RuntimeError("GOOGLE_API_KEY is not configured")
        self.llm = GoogleGenerativeAI(model=self.settings.gemini_model, temperature=0.1, google_api_key=self.settings.google_api_key)
        embeddings = GoogleGenerativeAIEmbeddings(model=self.settings.embedding_model, google_api_key=self.settings.google_api_key)
        chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50).split_documents(self._load_documents())
        store = Chroma.from_documents(documents=chunks, embedding=embeddings, collection_name="epcraft_products")
        self.retriever = store.as_retriever(search_kwargs={"k": 3})
        logger.info("RAG service initialized with %s chunks", len(chunks))

    def answer(self, question: str, chat_history: str) -> str:
        if not self.retriever or not self.llm:
            raise RuntimeError("RAG service is not ready")
        docs = self.retriever.invoke(question)
        context = "\n\n".join(doc.page_content for doc in docs)
        return str(self.llm.invoke(self.prompt.format(context=context, question=question, chat_history=chat_history)))
