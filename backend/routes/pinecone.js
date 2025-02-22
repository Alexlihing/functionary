const express = require("express");
const router = express.Router();
const {
  saveToPinecone,
  queryPinecone,
  sendtoLLM,
} = require("../utils/RAGservice");

router.post("/embedCode", async (req, res) => {
  const { code, filename, userId } = req.body;

  await saveToPinecone(code, filename);

  res.status(200).json({ message: "Code saved to Pinecone" });
});

router.post("/queryPinecone", async (req, res) => {
  const { query, userId } = req.body;

  let context = await queryPinecone(query, userId);
  let response = await sendtoLLM(query, context);

  res.status(200).json({ response: response });
});

module.exports = router;
