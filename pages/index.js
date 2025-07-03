import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = async () => {
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (res.ok) {
        setImageUrl(data.image);
      } else {
        setError(data.error || "Failed to generate image");
      }
    } catch (e) {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h1>PNG Pattern AI Image Generator</h1>
      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt, e.g. 'Papua New Guinean traditional patterns with vibrant colors'"
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />
      <button
        onClick={generateImage}
        disabled={loading || !prompt.trim()}
        style={{ marginTop: 10, padding: "10px 20px", fontSize: 16 }}
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: "100%", borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
