const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates an AI response based on the document text and user chat history.
 * @param {string} extractedText - The text extracted from the document
 * @param {Array} history - Previous chat history [{ role, text }]
 * @param {string} newMessage - The new question from the user
 * @returns {Promise<string>} The AI response
 */
const generateChatResponse = async (extractedText, history, newMessage) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  // Get the model
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // System instructions as a prefix
  const systemPrompt = `You are an AI assistant helping users understand an uploaded document.
Use ONLY the provided document content to answer the user's questions.
If the answer does not exist in the document, say: 'This information is not available in the uploaded file.'

Document Content:
${extractedText}
`;

  // Format history for Gemini (roles: 'user' and 'model')
  const formattedHistory = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  // Start chat session with history
  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I will use only the provided document to answer questions.' }],
      },
      ...formattedHistory,
    ],
    generationConfig: {
      temperature: 0.2, // Low temperature for more factual, grounded answers
      maxOutputTokens: 1000,
    },
  });

  // Send the new message
  const result = await chat.sendMessage([{ text: newMessage }]);
  const responseText = result.response.text();

  return responseText;
};

module.exports = {
  generateChatResponse,
};
