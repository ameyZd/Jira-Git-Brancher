import { GoogleGenerativeAI } from "@google/generative-ai";
import { message } from 'antd';

const generateBranchNames = async (jiraId: string, jiraDescription: string) => {
    try {
     const apiKey = import.meta.env.GEMINI_API_KEY; 
     
      if (!apiKey) {
        throw new Error('API key is not defined');
      }
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const result = await chatSession.sendMessage(`
        Create 6 (SIX) succinct branch names for Jira ID: ${jiraId} and Jira description: "${jiraDescription}". 
        Provide the branch names in a JSON array format without additional starting special symbols, characters, irrelevant text, or blank space.
        (example, sce-1657-FeatureName, ainba-789-featurename) 
        Ensure the branch names are in small case letters, also dont give enclose name in quotes.
      `);

      const branchNamesArray = result.response.text().trim().split(','); 
      return branchNamesArray; 

    } catch (error) {
      message.error("Error generating branch names");
      return [];
    }
  };

export default generateBranchNames;