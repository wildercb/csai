import { OpenAI } from 'openai';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Pinecone } from '@pinecone-database/pinecone';

const USE_OPENROUTER = process.env.USE_OPENROUTER === 'true';

const openai = new OpenAI({
  apiKey: USE_OPENROUTER ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY,
  baseURL: USE_OPENROUTER ? 'https://openrouter.ai/api/v1' : undefined,
});

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const PINECONE_IDX_URL = process.env.PINECONE_IDX_URL;
const PINECONE_INDEX_SECONDARY = process.env.PINECONE_INDEX_SECONDARY;



let pinecone = null;

async function initPinecone(index_name) {

  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(index_name);
  
  console.log("index?")
  return index;
}

async function initPineconeSecondary() {

  const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  const index = pc.index(PINECONE_INDEX_SECONDARY);
  
  console.log("index?")
  return index;
}

async function queryPinecone(query, index_name) {  
  try {
    const index = await initPinecone(index_name);
    
    console.log("Creating embeddings...");
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: USE_OPENROUTER ? process.env.OPENROUTER_API_KEY : process.env.OPENAI_API_KEY,
    });
    const queryEmbedding = await embeddings.embedQuery(query);

    console.log("Querying Pinecone index...");
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
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
    const relevantDocs = await queryPinecone(userMessage, PINECONE_INDEX_NAME);
    const relevantDocsSecondary = await queryPinecone(userMessage, PINECONE_INDEX_SECONDARY);

    
    console.log("Relevant documents:", relevantDocs);
    
    const systemMessage = {
      role: "system",
      content: 
      `You are an advanced health assistant with extensive medical knowledge. Your primary goal is to provide accurate, evidence-based information to support users' health queries. Utilize the following curated medical information to inform your responses:
    
      ${relevantDocs.join("\n\n")}
      ${relevantDocsSecondary.join("\n\n")}
    
      Analyze this information critically and combine it with your broad understanding of health and medicine. When responding:
      
      1. Prioritize user safety and well-being above all else.
      2. Provide comprehensive, nuanced answers that consider multiple aspects of the user's query.
      3. Explain complex medical concepts in clear, accessible language.
      4. When appropriate, discuss potential risks, benefits, and alternatives related to treatments or health decisions.
      5. Encourage users to consult with qualified healthcare professionals for personalized medical advice, diagnosis, or treatment.
      6. Stay up-to-date with current medical guidelines and best practices.
      7. Respect user privacy and maintain strict confidentiality.
      8. If the provided information is insufficient to answer a query, draw upon your general medical knowledge, clearly stating when you are doing so.
      9. Be prepared to engage in follow-up questions to gain a deeper understanding of the user's health concerns.
      10. When discussing sensitive health topics, maintain a professional and empathetic tone.
    
      Your responses should be tailored to each user's unique situation, demonstrating both expertise and compassion. Aim to empower users with knowledge while emphasizing the importance of professional medical care.`
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
