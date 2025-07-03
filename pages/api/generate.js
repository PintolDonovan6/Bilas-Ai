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
        version: 'c7cf29c06c8e8e7c5ba7df4e9df3a0b14a509a43408e7a2e4e2e4e3ec60fa4d2', // 👈 SDXL 1.0
        input: {
          prompt,
          width: 512,
          height: 512,
        },
      }),
    });

    const prediction = await response.json();
    if (prediction.error) {
      console.error('Prediction error:', prediction.error);
      return res.status(500).json({ error: prediction.error });
    }

    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      result = await pollRes.json();
    }

    if (result.status === 'succeeded') {
      return res.status(200).json({ image: result.output[0] });
    } else {
      console.error('Generation failed:', result);
      return res.status(500).json({ error: 'Image generation failed.' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
