const axios = require("axios");
const { Pinecone } = require("@pinecone-database/pinecone");

// Configure logging
const logger = {
  debug: (...args) =>
    process.env.NODE_ENV === "development" && console.debug("[DEBUG]", ...args),
  info: (...args) => console.info("[INFO]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

// Initialize Pinecone with error handling
let pinecone;
try {
  if (!process.env.PINECONE_KEY) {
    throw new Error("PINECONE_KEY environment variable is not set");
  }

  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_KEY,
  });
  logger.info("Pinecone initialized successfully");
} catch (error) {
  logger.error("Failed to initialize Pinecone:", error.message);
  process.exit(1);
}

// Access the index with validation
let index;
try {
  index = pinecone.Index("quickstart");
  logger.info(`Connected to Pinecone index: ${"quickstart"}`);
} catch (error) {
  logger.error("Failed to connect to Pinecone index:", error.message);
  process.exit(1);
}

// Function to get embeddings with enhanced error handling
const getEmbedding = async (text) => {
  logger.debug(`Generating embedding for text of length: ${text.length}`);

  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input text for embedding");
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        input: text,
        model: "text-embedding-ada-002",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    if (!response.data?.data?.[0]?.embedding) {
      throw new Error("Invalid response structure from OpenAI API");
    }

    logger.debug(
      `Successfully generated embedding (dimension: ${response.data.data[0].embedding.length})`
    );
    return response.data.data[0].embedding;
  } catch (error) {
    logger.error("OpenAI API Error:", error.response?.data || error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

// Data structures with validation
class FileString {
  constructor(filePath, content, FunctionDef = [], FunctionCall = []) {
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath for FileString");
    }
    if (typeof content !== "string") {
      throw new Error("Invalid content for FileString");
    }

    this.filePath = filePath;
    this.content = content;
    this.FunctionDef = Array.isArray(FunctionDef) ? FunctionDef : [];
    this.FunctionCall = Array.isArray(FunctionCall) ? FunctionCall : [];

    logger.debug(`Created FileString for: ${filePath}`);
  }
}

class FunctionDef {
  constructor(filePath, name, params = [], code = "") {
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath for FunctionDef");
    }
    if (typeof name !== "string" || !name) {
      throw new Error("Invalid name for FunctionDef");
    }

    this.filePath = filePath;
    this.name = name;
    this.params = Array.isArray(params) ? params : [];
    this.code = typeof code === "string" ? code : "";

    logger.debug(`Created FunctionDef: ${name} in ${filePath}`);
  }
}

class FunctionCall {
  constructor(filePath, parentFunc, name, args = []) {
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid filePath for FunctionCall");
    }
    if (typeof name !== "string" || !name) {
      throw new Error("Invalid name for FunctionCall");
    }

    this.filePath = filePath;
    this.parentFunc = parentFunc || "global";
    this.name = name;
    this.args = Array.isArray(args) ? args : [];

    logger.debug(`Created FunctionCall: ${name} in ${filePath}`);
  }
}

// Flattening functions with validation
function flattenFunctionDef(funcDef) {
  try {
    if (!(funcDef instanceof FunctionDef)) {
      throw new Error("Invalid FunctionDef object");
    }

    const flattened = `FunctionDef:${funcDef.name} file=${
      funcDef.filePath
    } params=${funcDef.params.join(", ")} code=${funcDef.code}`;

    logger.debug(`Flattened FunctionDef: ${funcDef.name}`);
    return flattened;
  } catch (error) {
    logger.error("Failed to flatten FunctionDef:", error.message);
    throw error;
  }
}

function flattenFunctionCall(funcCall) {
  try {
    if (!(funcCall instanceof FunctionCall)) {
      throw new Error("Invalid FunctionCall object");
    }

    const flattened = `FunctionCall:${funcCall.name} file=${
      funcCall.filePath
    } parentFunc=${funcCall.parentFunc} args=${funcCall.args.join(", ")}`;

    logger.debug(`Flattened FunctionCall: ${funcCall.name}`);
    return flattened;
  } catch (error) {
    logger.error("Failed to flatten FunctionCall:", error.message);
    throw error;
  }
}

function flattenFileString(fileString) {
  try {
    if (!(fileString instanceof FileString)) {
      throw new Error("Invalid FileString object");
    }

    let result = `File:${fileString.filePath}\n`;
    result += `Content:${fileString.content.substring(0, 100)}...\n`; // Truncate content
    result += `Functions:\n${fileString.FunctionDef.map(
      flattenFunctionDef
    ).join("\n")}\n`;
    result += `Calls:\n${fileString.FunctionCall.map(flattenFunctionCall).join(
      "\n"
    )}`;

    logger.debug(`Flattened FileString for: ${fileString.filePath}`);
    return result;
  } catch (error) {
    logger.error("Failed to flatten FileString:", error.message);
    throw error;
  }
}

// Chunking with validation
function chunkFileString(fileString) {
  try {
    if (!(fileString instanceof FileString)) {
      throw new Error("Invalid FileString object for chunking");
    }

    const chunks = [];
    logger.debug(`Starting chunking for: ${fileString.filePath}`);

    // File content chunk
    if (fileString.content) {
      chunks.push({
        type: "file",
        content: `File:${
          fileString.filePath
        }\nContent:${fileString.content.substring(0, 500)}...`,
      });
    }

    // FunctionDef chunks
    fileString.FunctionDef.forEach((funcDef, index) => {
      try {
        chunks.push({
          type: "functionDef",
          content: flattenFunctionDef(funcDef),
        });
      } catch (error) {
        logger.warn(
          `Skipping invalid FunctionDef at index ${index} in ${fileString.filePath}: ${error.message}`
        );
      }
    });

    // FunctionCall chunks
    fileString.FunctionCall.forEach((funcCall, index) => {
      try {
        chunks.push({
          type: "functionCall",
          content: flattenFunctionCall(funcCall),
        });
      } catch (error) {
        logger.warn(
          `Skipping invalid FunctionCall at index ${index} in ${fileString.filePath}: ${error.message}`
        );
      }
    });

    logger.info(`Generated ${chunks.length} chunks for ${fileString.filePath}`);
    return chunks;
  } catch (error) {
    logger.error("Failed to chunk FileString:", error.message);
    throw error;
  }
}

// Embedding chunks with batch handling
async function embedChunks(chunks) {
  try {
    if (!Array.isArray(chunks)) {
      throw new Error("Invalid chunks array");
    }

    logger.info(`Starting embedding for ${chunks.length} chunks`);
    const startTime = Date.now();

    const results = await Promise.allSettled(
      chunks.map(async (chunk, index) => {
        try {
          const embedding = await getEmbedding(chunk.content);
          return { ...chunk, embedding };
        } catch (error) {
          logger.warn(`Failed to embed chunk ${index}: ${error.message}`);
          return null;
        }
      })
    );

    const embeddedChunks = results
      .filter(
        (result) => result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value);

    const failedCount = results.length - embeddedChunks.length;
    if (failedCount > 0) {
      logger.warn(`Failed to embed ${failedCount}/${chunks.length} chunks`);
    }

    logger.info(
      `Completed embedding in ${Date.now() - startTime}ms (success: ${
        embeddedChunks.length
      }, failed: ${failedCount})`
    );
    return embeddedChunks;
  } catch (error) {
    logger.error("Embedding process failed:", error.message);
    throw error;
  }
}

// Save to Pinecone with batch error handling
async function saveToPinecone(fileStrings) {
  const logger = console; // Assuming a logger is used based on logs
  logger.info(`Starting Pinecone upsert for ${fileStrings.length} files`);

  for (const fileString of fileStrings) {
    try {
      // Chunk the file content
      const chunks = chunkFileString(fileString); // Assume this function exists
      logger.info(
        `Generated ${chunks.length} chunks for ${fileString.filePath}`
      );

      // Embed the chunks
      logger.info(`Starting embedding for ${chunks.length} chunks`);
      const startTime = Date.now();
      const embeddedChunks = await embedChunks(chunks); // Assume this function exists
      logger.info(
        `Completed embedding in ${Date.now() - startTime}ms (success: ${
          embeddedChunks.length
        }, failed: 0)`
      );

      // Prepare vectors
      const vectors = embeddedChunks.map((chunk, i) => ({
        id: `${fileString.filePath}_${i}`.replace(/[^a-zA-Z0-9]/g, "_"), // Ensure valid ID
        values: chunk.embedding,
        metadata: {
          filename: fileString.filePath,
          type: chunk.type,
          content: chunk.content.substring(0, 200), // Limit metadata size
        },
      }));

      // Upsert to Pinecone (pass vectors array directly)
      await index.upsert(vectors); // Changed from { vectors }
      logger.info(
        `Successfully upserted ${vectors.length} vectors for ${fileString.filePath}`
      );
    } catch (error) {
      logger.error(
        `Failed to process ${fileString.filePath}: ${error.message}`
      );
      throw error; // Re-throw to handle partial failure
    }
  }

  logger.info(`Completed Pinecone upsert`);
}
// Query Pinecone with enhanced validation
async function queryPinecone(query, topK = 5) {
  try {
    if (!query || typeof query !== "string") {
      throw new Error("Invalid query string");
    }

    logger.info(`Querying Pinecone: "${query.substring(0, 50)}..."`);
    const startTime = Date.now();

    const queryEmbedding = await getEmbedding(query);
    const queryResult = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    if (!queryResult.matches || !Array.isArray(queryResult.matches)) {
      throw new Error("Invalid response format from Pinecone");
    }

    const relevantChunks = queryResult.matches
      .filter((match) => match.metadata)
      .map((match) => match.metadata);

    logger.info(
      `Query completed in ${Date.now() - startTime}ms. Found ${
        relevantChunks.length
      } relevant chunks.`
    );
    return relevantChunks;
  } catch (error) {
    logger.error("Pinecone query failed:", error.message);
    throw error;
  }
}

// LLM interaction with improved error handling
async function sendtoLLM(context, query) {
  try {
    const startTime = Date.now();
    logger.info(`Sending to LLM: ${query.substring(0, 50)}...`);

    const prompt = {
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a code assistant analyzing a codebase.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${query}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      prompt,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response structure from OpenAI API");
    }

    const answer = response.data.choices[0].message.content;
    logger.info(
      `LLM response generated in ${Date.now() - startTime}ms (tokens: ${
        response.data.usage?.total_tokens || "unknown"
      })`
    );
    return answer;
  } catch (error) {
    logger.error(
      "LLM interaction failed:",
      error.response?.data || error.message
    );
    throw new Error(`LLM request failed: ${error.message}`);
  }
}

// Explanation functions with error handling
async function explain(functionName) {
  try {
    if (!functionName || typeof functionName !== "string") {
      throw new Error("Invalid function name");
    }

    logger.info(`Explaining function: ${functionName}`);
    const query = `FunctionDef:${functionName} OR FunctionCall:${functionName}`;
    const context = await queryPinecone(query, 10);
    return context;
  } catch (error) {
    logger.error("Explain function failed:", error.message);
    throw error;
  }
}

async function GPTExplain(functionName, context) {
  try {
    const startTime = Date.now();
    logger.info(`Generating detailed explanation for: ${functionName}`);

    // Extract and format context content
    const contextContent = context
      .map((chunk) => chunk.content)
      .join("\n\n")
      .substring(0, 3000); // Limit to 3000 characters to avoid token limits

    const prompt = {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer explaining a function's purpose and usage. 
            Analyze the provided context and provide a detailed explanation following this structure:
            1. Purpose: detailed description of what the function does in relation to the codebase.
            2. Parameters: List with types and descriptions
            3. Returns: Output type and description
            4. Function Relationships: Callers and callees
            5. Usage Notes: Important considerations
            6. Example: Code snippet from context
            
            Format using markdown with bold section headers.`,
        },
        {
          role: "user",
          content: `**Function to Explain**: ${functionName}
            
            **Relevant Context**:
            ${contextContent}
            
            **Explanation**:`,
        },
      ],
      temperature: 0.3, // Lower for more factual responses
      max_tokens: 1000,
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      prompt,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response structure from OpenAI API");
    }

    const explanation = response.data.choices[0].message.content;
    logger.info(
      `Generated explanation in ${Date.now() - startTime}ms (tokens: ${
        response.data.usage?.total_tokens || "unknown"
      })`
    );
    return explanation;
  } catch (error) {
    logger.error("GPTExplain failed:", error.response?.data || error.message);
    throw error;
  }
}

async function generalizedExplain(query) {
  try {
    const startTime = Date.now();
    logger.info(`Generating detailed explanation for: ${query}`);

    // Retrieve relevant context from Pinecone
    const context = await queryPinecone(query, 10);

    // Extract and format context content
    const contextContent = context
      .map((chunk) => chunk.content)
      .join("\n\n")
      .substring(0, 3000); // Limit to 3000 characters to avoid token limits

    const prompt = {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer explaining code to a developer. Always respond in JSON format:
            \`\`\`json
            {
              "summary": "Brief explanation",
              "detailedExplanation": "In-depth analysis",
              "codeSnippets": [
                {
                  "description": "What the snippet does",
                  "snippet": "Actual code snippet"
                }
              ]
            }
            \`\`\`
            No extra text—just valid JSON.`,
        },
        {
          role: "user",
          content: `**User Question**:
                ${query}
        
                **Relevant Code Context**:
                ${contextContent}
        
                **Your Explanation**:`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      prompt,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // 30 seconds timeout
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response structure from OpenAI API");
    }

    const explanation = response.data.choices[0].message.content;
    logger.info(
      `Generated explanation in ${Date.now() - startTime}ms (tokens: ${
        response.data.usage?.total_tokens || "unknown"
      })`
    );

    return explanation;
  } catch (error) {
    logger.error("GPTExplain failed:", error.response?.data || error.message);
    throw new Error(`Failed to generate explanation: ${error.message}`);
  }
}

module.exports = {
  FileString,
  FunctionDef,
  FunctionCall,
  saveToPinecone,
  queryPinecone,
  sendtoLLM,
  explain,
  GPTExplain,
  generalizedExplain,
};
