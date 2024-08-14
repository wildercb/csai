import fetch from 'node-fetch';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const url = 'https://healthsupport-vqchnux.svc.aped-4627-b74a.pinecone.io';

async function testPineconeConnection() {
  try {
    console.log(`Testing connection to Pinecone at: ${url}`);

    const response = await fetch(url, {
      method: 'GET',  // Adjust this if a different method is required
      headers: {
        'Api-Key': PINECONE_API_KEY,
      },
    });

    const text = await response.text();  // Get the raw response as text

    console.log('Raw response:', text);  // Log the raw response text

    if (!response.ok) {
      console.error(`Failed to connect to Pinecone: ${response.statusText}`);
      return;
    }

    try {
      const data = JSON.parse(text);  // Try to parse the response as JSON
      console.log('Connection successful. Project data:', data);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError.message);
    }

  } catch (error) {
    console.error('Error during fetch:', error.message);
  }
}

testPineconeConnection();
