export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Use Replicate's stable-diffusion model latest version
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "7de24e09108b8ed6d5fbb1f027ef14e9b6f90b46b62d248ea707e74d1bf1e14f", // stable-diffusion v2.1 latest version
        input: { prompt, width: 512, height: 512 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `Replicate API error: ${err}` });
    }

    const prediction = await response.json();

    // Poll until complete
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      result = await pollRes.json();
    }

    if (result.status === "succeeded") {
      return res.status(200).json({ image: result.output[0] });
    } else {
      return res.status(500).json({ error: "Image generation failed." });
    }
  } catch (error) {
    console.error("Error in generate API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
