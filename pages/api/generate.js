// pages/api/generate.js

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: "512x512",
    });

    const imageUrl = response.data.data[0].url;
    res.status(200).json({ image: imageUrl });
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    res.status(500).json({ error: "Image generation failed" });
  }
}
