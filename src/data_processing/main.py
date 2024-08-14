
import os
from document_processor import process_document
from embeddings_generator import generate_embeddings
from pinecone_uploader import upload_to_pinecone

def process_and_upload_documents(directory_path: str, index_name: str):
    """Process all documents in a directory and upload to Pinecone."""
    all_chunks = []
    
    for root, _, files in os.walk(directory_path):
        for file in files:
            file_path = os.path.join(root, file)
            chunks = process_document(file_path)
            all_chunks.extend(chunks)
    
    embeddings = generate_embeddings(all_chunks)
    upload_to_pinecone(embeddings, index_name)

if __name__ == "__main__":
    documents_directory = "path/to/your/documents"
    pinecone_index_name = "health-support-index"
    process_and_upload_documents(documents_directory, pinecone_index_name)