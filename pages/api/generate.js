export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "a9758cb3b9dfce70d5d7a27447f0e9b3c6e9f1c77d45ee49f9e416a13f3e6605d",
        input: { prompt, width: 512, height: 512 }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    let status = data;
    while (status.status !== "succeeded" && status.status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
        }
      });
      status = await checkRes.json();
    }

    if (status.status === "succeeded") {
      return res.status(200).json({ image: status.output[0] });
    } else {
      return res.status(500).json({ error: "Image generation failed" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
