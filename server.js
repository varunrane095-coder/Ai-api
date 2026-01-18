const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS fix
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

// HuggingFace token from Render (secure)
const HF_TOKEN = process.env.HF_TOKEN;

// Health check
app.get("/", (req, res) => {
  res.send("AI API is running");
});

// Prompt → Image API
app.post("/api/ai/generate-image", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.length < 5) {
    return res.json({ error: "Prompt too short" });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    res.json({
      image: `data:image/png;base64,${base64}`,
      error: null
    });

  } catch (err) {
    res.json({ error: "AI server error" });
  }
});

app.listen(PORT, () => {
  console.log("AI API running on port " + PORT);
});
