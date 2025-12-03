const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const buildPrompt = (action, text, extra) => {
  switch (action) {
    case "improve":
      return `
Rewrite the text below to be clearer, more professional and well-structured.
Keep original meaning. Output ONLY the improved text.

TEXT:
${text}
`;
    case "summarize":
      return `
Summarize the following text in 3-5 bullet points:

TEXT:
${text}
`;
    case "expand":
      return `
Expand this note into 2-3 meaningful paragraphs without losing the point:

NOTE:
${text}
`;
    case "checklist":
      return `
Turn the following note into a checklist of actionable steps:

NOTE:
${text}
`;
    default:
      return `${extra}\n\n${text}`;
  }
};

const generateAIResponse = async ({ action, text, promptExtra, model }) => {
  const finalPrompt = buildPrompt(action, text, promptExtra);

  const completion = await openai.chat.completions.create({
    model: model || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are NotesFlow AI Assistant. Be concise and helpful.",
      },
      { role: "user", content: finalPrompt },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  return completion.choices[0].message.content;
};

module.exports = {
  generateAIResponse,
};
