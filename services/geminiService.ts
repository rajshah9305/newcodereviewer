import { GoogleGenAI, Type } from "@google/genai";

/**
 * Analyzes a code snippet using the Gemini API and expects a structured JSON response.
 * @param code The code string to analyze.
 * @param systemInstruction The system instruction to guide the AI model.
 * @returns A promise that resolves to the analysis as a JSON string.
 */
export const analyzeCode = async (code: string, systemInstruction: string): Promise<string> => {
    // API Key is sourced from environment variables, aligning with production best practices.
    if (!process.env.API_KEY) {
        throw new Error("API Key is not configured. Please ensure it is set in the deployment environment.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please analyze the following code snippet:\n\`\`\`\n${code}\n\`\`\``,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        findings: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: {
                                        type: Type.STRING,
                                        enum: ['Bug', 'Suggestion', 'Security', 'Style', 'Performance'],
                                        description: 'The category of the finding.'
                                    },
                                    title: {
                                        type: Type.STRING,
                                        description: 'A concise title for the finding.'
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: 'A detailed explanation of the issue and the suggested improvement.'
                                    },
                                    code: {
                                        type: Type.STRING,
                                        description: 'An optional code snippet demonstrating the suggested change. Can be an empty string.'
                                    }
                                },
                                required: ['type', 'title', 'description']
                            }
                        }
                    },
                    required: ['findings']
                },
            },
        });

        const text = response.text;
        if (text) {
            return text;
        } else {
            throw new Error("The response from the model was empty. This could be due to content safety filters or a temporary issue. Please try again.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                 throw new Error("The configured API key is invalid. Please check the environment configuration.");
            }
            throw new Error(`Failed to analyze code: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the API.");
    }
};
