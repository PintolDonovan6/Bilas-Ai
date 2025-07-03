import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setImage(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.image) {
        setImage(data.image);
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reach server');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 30, fontFamily: 'sans-serif' }}>
      <h1>PNG Cartoon Generator</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your cartoon..."
        style={{ width: '300px', padding: 8 }}
      />
      <button onClick={handleGenerate} style={{ marginLeft: 10, padding: '8px 16px' }}>
        Generate
      </button>
      {loading && <p>Generating...</p>}
      {image && (
        <div style={{ marginTop: 20 }}>
          <img src={image} alt="Generated cartoon" width="512" height="512" />
        </div>
      )}
    </div>
  );
}
