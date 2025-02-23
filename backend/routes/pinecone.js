const express = require("express");
const router = express.Router();
const {
  saveToPinecone,
  queryPinecone,
  sendtoLLM,
  explain,
  GPTExplain,
  FileString,
  FunctionDef,
  FunctionCall,
  generalizedExplain,
} = require("../utils/RAGservice");

router.post("/embedCode", async (req, res) => {
  try {
    console.log(req.body, "body"); // Keep for debugging
    const { fileStrings: plainFileStrings } = req.body;

    // Validate that fileStrings is an array
    if (!Array.isArray(plainFileStrings)) {
      throw new Error("fileStrings must be an array");
    }

    // Convert plain objects to FileString instances
    const fileStrings = plainFileStrings.map((plain) => {
      // Validate required fields
      if (!plain.filePath || typeof plain.filePath !== "string") {
        throw new Error("Invalid or missing filePath in fileString");
      }
      if (typeof plain.content !== "string") {
        throw new Error("Invalid or missing content in fileString");
      }

      // Map FunctionDef array to instances (assuming it might be populated elsewhere)
      const FunctionDefInstances = (plain.FunctionDef || []).map((def) => {
        if (!def.filePath || typeof def.filePath !== "string") {
          throw new Error("Invalid filePath in FunctionDef");
        }
        if (typeof def.name !== "string" || !def.name) {
          throw new Error("Invalid or missing name in FunctionDef");
        }
        return new FunctionDef(
          def.filePath,
          def.name,
          def.params || [],
          def.code || ""
        );
      });

      // Map FunctionCall array to instances (assuming it might be populated elsewhere)
      const FunctionCallInstances = (plain.FunctionCall || []).map((call) => {
        if (!call.filePath || typeof call.filePath !== "string") {
          throw new Error("Invalid filePath in FunctionCall");
        }
        if (typeof call.name !== "string" || !call.name) {
          throw new Error("Invalid or missing name in FunctionCall");
        }
        return new FunctionCall(
          call.filePath,
          call.parentFunc, // May be null/undefined, defaults to "global" in constructor
          call.name,
          call.args || []
        );
      });

      // Create new FileString instance
      return new FileString(
        plain.filePath,
        plain.content,
        FunctionDefInstances,
        FunctionCallInstances
      );
    });

    // Pass the array of FileString instances to saveToPinecone
    await saveToPinecone(fileStrings);
    res.status(200).json({ message: "Code saved to Pinecone" });
  } catch (error) {
    console.error("Embed code failed:", error.message);
    res.status(500).json({ error: "Embedding failed", details: error.message });
  }
});

router.post("/queryPinecone", async (req, res) => {
  try {
    const { query } = req.body;
    const results = await queryPinecone(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Query failed:", error.message);
    res.status(500).json({ error: "Query failed", details: error.message });
  }
});

router.post("/explain", async (req, res) => {
  try {
    const { functionName } = req.body;
    const context = await explain(functionName);
    const explanation = await GPTExplain(functionName, context);
    res.status(200).json({ explanation });
  } catch (error) {
    console.error("Explanation failed:", error.message);
    res
      .status(500)
      .json({ error: "Explanation failed", details: error.message });
  }
});

router.post("/GenExplain", async (req, res) => {
  const { query } = req.body;

  try {
    const response = await generalizedExplain(query);
    res.status(200).json({ completion: response });
  } catch (error) {
    console.error("Explanation failed:", error.message);
    res
      .status(500)
      .json({ error: "Explanation failed", details: error.message });
  }
});
module.exports = router;
