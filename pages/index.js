import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');

      setImage(data.image);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Generate Image with Replicate API</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt here"
        style={{ width: '80%', padding: '8px' }}
      />
      <button onClick={handleGenerate} disabled={loading || !prompt} style={{ marginLeft: 10, padding: '8px 16px' }}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {image && (
        <div style={{ marginTop: 20 }}>
          <img src={image} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </main>
  );
}
