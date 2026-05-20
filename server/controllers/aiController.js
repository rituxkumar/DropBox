const File = require('../models/File');
const { extractTextFromFile } = require('../utils/textExtraction');
const { generateChatResponse } = require('../services/geminiService');

// @desc    Chat with a specific file using AI
// @route   POST /api/ai/chat/:fileId
// @access  Private
const chatWithFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Find the file and ensure user owns it
    const file = await File.findOne({ _id: fileId, uploadedBy: req.user._id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Check if the file type is supported for AI
    const supportedTypes = ['pdf', 'document'];
    const isTextMime = file.mimeType.includes('text/');
    if (!supportedTypes.includes(file.fileType) && !isTextMime) {
      return res.status(400).json({ success: false, message: 'File type not supported for AI chat' });
    }

    // Ensure text is extracted and cached in the DB
    if (!file.extractedText) {
      const extractedText = await extractTextFromFile(file.fileUrl, file.fileType, file.mimeType);
      file.extractedText = extractedText;
      await file.save();
    }

    // Prepare chat history for Gemini (max last 10 messages for context window saving)
    const historySlice = file.aiChatHistory.slice(-10);

    // Call Gemini Service
    const aiResponse = await generateChatResponse(file.extractedText, historySlice, message);

    // Save Q&A to chat history
    file.aiChatHistory.push({ role: 'user', text: message });
    file.aiChatHistory.push({ role: 'model', text: aiResponse });
    await file.save();

    res.status(200).json({
      success: true,
      data: {
        role: 'model',
        text: aiResponse,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history for a specific file
// @route   GET /api/ai/history/:fileId
// @access  Private
const getChatHistory = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    // Find the file and ensure user owns it
    const file = await File.findOne({ _id: fileId, uploadedBy: req.user._id });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.status(200).json({
      success: true,
      data: file.aiChatHistory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithFile,
  getChatHistory,
};
