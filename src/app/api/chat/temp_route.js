import { OpenAI } from 'openai';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";


const USE_OPENROUTER = process.env.USE_OPENROUTER === 'true';

const openai = new OpenAI({
  apiKey: USE_OPENROUTER ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY,
  baseURL: USE_OPENROUTER ? 'https://openrouter.ai/api/v1' : undefined,
});

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const PINECONE_IDX_URL = process.env.PINECONE_IDX_URL;

async function testNetworkConnection() {
  // Helper function to verify network connection to Pinecone by checking env variables are properly set. 
  const url = PINECONE_IDX_URL;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': PINECONE_API_KEY,
      },
    });
    console.log('Pinecone API response:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('Error reaching Pinecone API:', error.message);
    return false;
  }
}

const pinecone = new PineconeClient();

async function queryPinecone(query) {
  console.log("Querying Pinecone...");
  
  try {
    await pinecone.init({
      environment: PINECONE_ENVIRONMENT,
      apiKey: PINECONE_API_KEY,
    });

    const index = pinecone.Index(PINECONE_INDEX_NAME);
    
    const embeddings = new OpenAIEmbeddings();
    const queryEmbedding = await embeddings.embedQuery(query);

    const queryResponse = await index.query({
      queryRequest: {
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
      }
    });

    console.log("Pinecone query response:", JSON.stringify(queryResponse, null, 2));

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.warn("No matches found in Pinecone response");
      return ["I don't have any specific information about that in my knowledge base. I'll try to answer based on my general knowledge."];
    }

    return queryResponse.matches.map((match) => match.metadata.text);
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    return ["I'm sorry, but I'm having trouble accessing my knowledge base at the moment. I'll do my best to answer based on my general knowledge."];
  }
}

export async function POST(req) {
  const requestBody = await req.json();
  const messages = requestBody.messages;

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing required parameter: messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userMessage = messages[messages.length - 1].content;
    const relevantDocs = await queryPinecone(userMessage);
    
    console.log(relevantDocs);
    
    const systemMessage = {
      role: "system",
      content: 
      `You are a helpful health assistant. Use the following information to answer the user's question, 
      but do not reference the information directly. If the information doesn't help answer the question, 
      use your general knowledge: ${relevantDocs.join("\n\n")}`,
    };

    const augmentedMessages = [systemMessage, ...messages];

    const response = await openai.chat.completions.create({
      model: USE_OPENROUTER ? 'openai/gpt-4-0613' : 'gpt-4-0613',
      messages: augmentedMessages,
      ...(USE_OPENROUTER && {
        headers: {
          'HTTP-Referer': 'https://your-website.com', // Replace with your actual website
          'X-Title': 'Your App Name', // Replace with your app name
        },
      }),
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
