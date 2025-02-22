const { PineconeClient } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { OpenAI } = require("langchain/llms/openai");
const { PromptTemplate } = require("langchain/prompts");

// Initialize Pinecone client
const pinecone = new PineconeClient();
await pinecone.init({
  environment: process.env.PINECONE_ENVIRONMENT,
  apiKey: process.env.PINECONE_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.5,
});

async function chunkCode(code) {
  // Split code into functions and main logic using regex
  const functionRegex = /(function[^{]+\{[\s\S]*?\n\})/g;
  const functions = code.match(functionRegex) || [];

  // Get remaining code that's not in functions
  const nonFunctionCode = code.replace(functionRegex, "").trim();
  const mainChunks = nonFunctionCode.split(/\n{2,}/); // Split by double newlines

  return [...functions, ...mainChunks].filter(
    (chunk) => chunk.trim().length > 0
  );
}

async function embedCode(code) {
  return await embeddings.embedQuery(code);
}

async function saveToPinecone(code, filename) {
  const index = pinecone.Index(process.env.PINECONE_INDEX);
  const chunks = await chunkCode(code);

  const vectors = await Promise.all(
    chunks.map(async (chunk, i) => ({
      id: `${filename}_${i}`,
      metadata: {
        filename,
        chunkNumber: i,
        content: chunk,
      },
      values: await embedCode(chunk),
    }))
  );

  await index.upsert({ vectors });
}

async function queryPinecone(queryEmbedding, topK = 5) {
  const index = pinecone.Index(process.env.PINECONE_INDEX);

  // Query Pinecone
  const queryResult = await index.query({
    queryRequest: {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    },
  });

  // Get unique filenames from results
  const filenames = [
    ...new Set(queryResult.matches.map((match) => match.metadata.filename)),
  ];

  // Get all chunks for these filenames
  const allChunks = await Promise.all(
    filenames.map(async (filename) => {
      const response = await index.fetch({ ids: [`${filename}_0`] }); // Just need one to get namespace
      return Object.values(response.vectors)
        .map((vec) => vec.metadata.content)
        .join("\n\n");
    })
  );

  return allChunks.join("\n\n");
}

async function sendtoLLM(context, query) {
  const template = `
You are a code assistant analyzing a codebase. Use this context to answer:
\`\`\`
{context}
\`\`\`

Question: {query}
Answer:`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ["context", "query"],
  });

  const formattedPrompt = await prompt.format({ context, query });

  return await model.call(formattedPrompt);
}

module.exports = {
  chunkCode,
  embedCode,
  saveToPinecone,
  queryPinecone,
  sendtoLLM,
};
