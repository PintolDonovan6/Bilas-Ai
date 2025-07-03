export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { prompt } = req.body;

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'a9758cb3b9dfce70d5d7a27447f0e9b3c6e9f1c77d45ee49f9e416a13f3e6605d',
        input: { prompt, width: 512, height: 512 },
      }),
    });

    const prediction = await response.json();
    if (prediction.error) throw new Error(prediction.error);

    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
      });
      result = await pollRes.json();
    }

    if (result.status === 'succeeded') {
      res.status(200).json({ image: result.output[0] });
    } else {
      res.status(500).json({ error: 'Image generation failed.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
