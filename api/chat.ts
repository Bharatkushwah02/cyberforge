interface ChatRequest {
  messages?: Array<{ role: 'user' | 'model'; text: string }>;
}

interface VercelRequest {
  method?: string;
  body?: ChatRequest;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (body: Record<string, unknown>) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY in Vercel Environment Variables.' });
  }

  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'At least one message is required.' });
  }

  const contents = messages.slice(-12).map((message) => ({
    role: message.role,
    parts: [{ text: message.text.slice(0, 4000) }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are the CyberForge security training assistant. Give concise defensive, educational answers. Do not provide instructions for attacking real systems.' }],
          },
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
        }),
      },
    );

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return res.status(502).json({ error: data.error?.message || 'Gemini request failed.' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    return res.status(200).json({ text });
  } catch {
    return res.status(502).json({ error: 'Unable to reach Gemini.' });
  }
}
