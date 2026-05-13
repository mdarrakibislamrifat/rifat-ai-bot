export async function generateEmbeddings(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: { parts: [{ text }] },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Embedding Error:", data);
    throw new Error(data.error?.message || "Embedding failed");
  }

  if (!data.embedding?.values) {
    throw new Error("No embedding values in response");
  }

  return data.embedding.values;
}