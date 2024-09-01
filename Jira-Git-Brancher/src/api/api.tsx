import { GoogleGenerativeAI } from "@google/generative-ai";

const generateBranchNames = async (jiraId: string, jiraDescription: string) => {
    try {
      // const apiKey = import.meta.env.GEMINI_API_KEY; 
      const apiKey = "AIzaSyB1psSTNsuknr8n9LhO2Kk8dkfqhxbHTdg"; 
  
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
        Create 4-5 succinct branch names for Jira ID: ${jiraId} and Jira description: "${jiraDescription}". 
        Provide branch names in the format: sce-1657-FeatureName\nsce-789-featurename. 
        Only return the branch names with no additional symbols, characters, or text.
        `);

      const branchNamesArray = result.response.text().trim().split('\n'); 
      return branchNamesArray; 

    } catch (error) {
      console.error("Error generating branch names:", error);
      return [];
    }
  };

export default generateBranchNames;