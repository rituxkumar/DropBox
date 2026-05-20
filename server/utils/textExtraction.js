const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Downloads a file from a given URL and extracts its text based on file type.
 * @param {string} url - The URL of the file (e.g. from Cloudinary)
 * @param {string} fileType - The file type ('pdf', 'document', 'other', etc.)
 * @param {string} mimeType - The exact mime type of the file
 * @returns {Promise<string>} The extracted text
 */
const extractTextFromFile = async (url, fileType, mimeType) => {
  try {
    // Download the file as arraybuffer
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    let extractedText = '';

    if (fileType === 'pdf' || mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (fileType === 'document' || mimeType.includes('document') || mimeType.includes('msword')) {
      // DOCX parsing
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (mimeType.includes('text/')) {
      // Plain text parsing
      extractedText = buffer.toString('utf8');
    } else {
      throw new Error('Unsupported file type for text extraction');
    }

    // Basic cleaning and truncation to prevent token overflow (e.g., limit to ~30,000 characters)
    extractedText = extractedText.replace(/\s+/g, ' ').trim();
    const MAX_CHARS = 30000;
    if (extractedText.length > MAX_CHARS) {
      extractedText = extractedText.substring(0, MAX_CHARS) + '\n\n...[Content truncated due to length limitations]';
    }

    return extractedText;
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error('Failed to extract text from file');
  }
};

module.exports = {
  extractTextFromFile,
};
