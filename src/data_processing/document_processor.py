# file: src/data_processing/document_processor.py

import os
from typing import List, Dict
import PyPDF2
import markdown
from bs4 import BeautifulSoup

def read_file(file_path: str) -> str:
    """Read content from various file types."""
    _, file_extension = os.path.splitext(file_path)
    
    if file_extension == '.pdf':
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            return ' '.join([page.extract_text() for page in reader.pages])
    
    elif file_extension in ['.txt', '.md']:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    
    elif file_extension == '.html':
        with open(file_path, 'r', encoding='utf-8') as file:
            soup = BeautifulSoup(file, 'html.parser')
            return soup.get_text()
    
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

def preprocess_text(text: str) -> str:
    """Clean and preprocess the text."""
    # Implement text cleaning logic here
    # For example: remove extra whitespace, special characters, etc.
    return text.strip()

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """Split the text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += (chunk_size - overlap)
    return chunks

def process_document(file_path: str) -> List[Dict[str, str]]:
    """Process a single document and return chunks with metadata."""
    content = read_file(file_path)
    cleaned_content = preprocess_text(content)
    chunks = chunk_text(cleaned_content)
    
    return [
        {
            "text": chunk,
            "metadata": {
                "source": file_path,
                "chunk_index": i
            }
        }
        for i, chunk in enumerate(chunks)
    ]

# file: src/data_processing/embeddings_generator.py

from typing import List, Dict
from sentence_transformers import SentenceTransformer

def generate_embeddings(chunks: List[Dict[str, str]], model_name: str = 'all-MiniLM-L6-v2') -> List[Dict[str, any]]:
    """Generate embeddings for text chunks."""
    model = SentenceTransformer(model_name)
    
    embeddings = []
    for chunk in chunks:
        vector = model.encode(chunk['text'])
        embeddings.append({
            "vector": vector.tolist(),
            "metadata": chunk['metadata'],
            "text": chunk['text']
        })
    
    return embeddings

# file: src/data_processing/pinecone_uploader.py

import pinecone
from typing import List, Dict

def upload_to_pinecone(embeddings: List[Dict[str, any]], index_name: str):
    """Upload embeddings to Pinecone."""
    pinecone.init(api_key=os.getenv('PINECONE_API_KEY'), environment=os.getenv('PINECONE_ENVIRONMENT'))
    
    if index_name not in pinecone.list_indexes():
        pinecone.create_index(index_name, dimension=len(embeddings[0]['vector']))
    
    index = pinecone.Index(index_name)
    
    batch_size = 100
    for i in range(0, len(embeddings), batch_size):
        batch = embeddings[i:i+batch_size]
        index.upsert(vectors=[(str(j+i), item['vector'], item['metadata']) for j, item in enumerate(batch)])
