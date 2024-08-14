import { PineconeClient } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

async function initPinecone() {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: PINECONE_API_KEY,
    environment: PINECONE_ENVIRONMENT,
  });
  return pinecone;
}

async function loadDocuments() {
  const loader = new DirectoryLoader("./data", {
    ".txt": (path) => new TextLoader(path),
  });
  const docs = await loader.load();
  return docs;
}

async function processDocuments(docs) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splitDocs = await textSplitter.splitDocuments(docs);
  return splitDocs;
}

async function indexDocuments(pinecone, docs) {
  const embeddings = new OpenAIEmbeddings();
  const index = pinecone.Index(PINECONE_INDEX_NAME);

  for (const doc of docs) {
    const embedding = await embeddings.embedQuery(doc.pageContent);
    await index.upsert([
      {
        id: doc.metadata.source,
        values: embedding,
        metadata: {
          text: doc.pageContent,
          source: doc.metadata.source,
        },
      },
    ]);
  }
}

async function main() {
  const pinecone = await initPinecone();
  const docs = await loadDocuments();
  const processedDocs = await processDocuments(docs);
  await indexDocuments(pinecone, processedDocs);
  console.log("Indexing complete!");
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});