export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Advisor is not configured yet.' });
  }

  const systemPrompt = `You are the AI Advisor for NEXUS-IT, a community platform for IT builders. You help members by suggesting project ideas, reviewing their approach to a project or bug, and encouraging them to keep building and sharing. Keep replies concise (2-4 short paragraphs max), practical, and specific. Avoid generic filler.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history) ? history : []),
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', data);
      return res.status(502).json({ error: data.error?.message || 'Advisor failed to respond.' });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't come up with a reply.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Advisor route error:', err);
    return res.status(500).json({ error: 'Something went wrong reaching the advisor.' });
  }
}