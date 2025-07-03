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
        version: 'db21e45a3b5402d0e7cfd1430a4e26c4caa13b6c5581aab3a7583d10652d9b61',
        input: {
          prompt: prompt,
          width: 512,
          height: 512
        },
      }),
    });

    let prediction = await response.json();
    if (prediction.error) throw new Error(prediction.error);

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      prediction = await pollRes.json();
    }

    if (prediction.status === 'succeeded') {
      return res.status(200).json({ image: prediction.output[0] });
    } else {
      return res.status(500).json({ error: 'Image generation failed.' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
