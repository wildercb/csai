console.log('Starting testEnv.js');

const loadEnv = require('./scripts/loadEnv');
console.log('loadEnv function imported');

loadEnv();
console.log('loadEnv function called');

console.log('Checking environment variables:');
console.log('PINECONE_API_KEY:', process.env.PINECONE_API_KEY ? 'Set' : 'Not set');
console.log('PINECONE_ENVIRONMENT:', process.env.PINECONE_ENVIRONMENT);
console.log('PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME);

console.log('testEnv.js completed');