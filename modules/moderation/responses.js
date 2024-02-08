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
              { type: "text", text: process.env.imageprompt},
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
  async filterstring(inputtext) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
        {
            role:"system",
            content: process.env.textprompt
        },
          {
            role: "user",
            content: inputtext
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
