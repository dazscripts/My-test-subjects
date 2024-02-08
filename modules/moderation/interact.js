const OpenAI = require("openai")

class OpenAIImageModerator {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyzeImage(imageUrl) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What’s in this image?" },
              {
                type: "image_url",
                image_url: { "url": imageUrl },
              },
            ],
          },
        ],
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing image with OpenAI:', error);
      throw error;
    }
  }
}

module.exports = OpenAIImageModerator;
