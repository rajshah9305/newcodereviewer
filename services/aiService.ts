// services/aiService.ts
import { GoogleGenAI, Type } from "@google/genai";

export interface AIProvider {
  id: string;
  name: string;
  requiresApiKey: boolean;
  models: string[];
  baseUrl?: string;
}

export interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    requiresApiKey: true,
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-pro', 'gemini-1.5-flash']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    requiresApiKey: true,
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    requiresApiKey: true,
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229']
  },
  {
    id: 'sambanova',
    name: 'SambaNova',
    requiresApiKey: true,
    baseUrl: 'https://api.sambanova.ai/v1',
    models: [
      'DeepSeek-R1',
      'DeepSeek-R1-Distill-Llama-70B',
      'DeepSeek-V3-0324',
      'Llama-3.3-Swallow-70B-Instruct-v0.4',
      'Qwen3-32B',
      'Meta-Llama-3.3-70B-Instruct',
      'Llama-4-Maverick-17B-128E-Instruct'
    ]
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    requiresApiKey: true,
    baseUrl: 'https://api.cerebras.ai/v1',
    models: [
      'gpt-oss-120b',
      'llama-3.3-70b',
      'llama-4-maverick-17b-128e-instruct',
      'llama-4-scout-17b-16e-instruct',
      'llama3.1-8b',
      'qwen-3-32b'
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    requiresApiKey: true,
    baseUrl: 'https://openrouter.ai/api/v1',
    models: ['deepseek/deepseek-v3-0324', 'deepseek/deepseek-r1-0528', 'qwen/qwen3-coder', 'deepseek/deepseek-r1', 'z-ai/glm-4-5-air', 'tng/deepseek-r1t2-chimera', 'moonshotai/kimi-k2', 'tng/deepseek-r1t-chimera', 'qwen/qwen3-235b-a22b', 'google/gemini-2.0-flash-experimental', 'meta-llama/llama-3.3-70b-instruct', 'microsoft/mai-ds-r1', 'openai/gpt-oss-20b', 'deepseek/deepseek-r1-0528-qwen3-8b', 'qwen/qwen3-14b', 'mistral/mistral-small-3.2-24b', 'google/gemma-3-27b', 'qwen/qwen2-5-vl-72b-instruct', 'mistral/mistral-nemo', 'mistral/mistral-small-3.1-24b', 'venice/uncensored', 'qwen/qwen2-5-coder-32b-instruct', 'deepseek/r1-distill-llama-70b']
  }
];

interface Finding {
  type: 'Bug' | 'Suggestion' | 'Security' | 'Style' | 'Performance';
  title: string;
  description: string;
  code?: string;
}

interface AnalysisResponse {
  findings: Finding[];
}

class AIService {
  // Test API key validity without full analysis
  async testAPIKey(config: AIConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const testCode = "function test() { return 'hello'; }";
      const testPrompt = "Briefly analyze this simple function and respond with JSON containing findings array.";
      
      // Call the appropriate service with a minimal test
      await this.analyzeCode(testCode, testPrompt, config);
      return { valid: true };
    } catch (error) {
      console.error(`API key test failed for ${config.provider}:`, error);
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('403')) {
          return { valid: false, error: 'Invalid API key' };
        }
        if (error.message.includes('404')) {
          return { valid: false, error: 'Service not available' };
        }
        if (error.message.includes('rate limit')) {
          return { valid: false, error: 'Rate limit exceeded' };
        }
        return { valid: false, error: error.message };
      }
      return { valid: false, error: 'Unknown error occurred' };
    }
  }

  private async callGemini(code: string, systemInstruction: string, config: AIConfig): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: config.model,
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
    if (!text) {
      throw new Error("The response from Gemini was empty. This could be due to content safety filters or a temporary issue. Please try again.");
    }
    return text;
  }

  private async callOpenAICompatible(code: string, systemInstruction: string, config: AIConfig, baseUrl?: string): Promise<string> {
    const provider = AI_PROVIDERS.find(p => p.id === config.provider);
    const url = baseUrl || provider?.baseUrl || 'https://api.openai.com/v1';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    };

    // Add OpenRouter specific headers
    if (config.provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'Elite AI Code Reviewer';
    }

    const requestBody = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: `${systemInstruction}\n\nYou must respond with valid JSON in this exact format: {"findings": [{"type": "Bug|Suggestion|Security|Style|Performance", "title": "Brief title", "description": "Detailed explanation", "code": "optional code snippet"}]}`
        },
        {
          role: 'user',
          content: `Please analyze the following code snippet:\n\`\`\`\n${code}\n\`\`\`\n\nRespond only with the JSON analysis, no additional text.`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    };

    const response = await fetch(`${url}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error(`Invalid API key for ${provider?.name || 'service'}`);
      }
      if (response.status === 403) {
        throw new Error(`Access forbidden for ${provider?.name || 'service'}`);
      }
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded for ${provider?.name || 'service'}`);
      }
      if (response.status === 404) {
        throw new Error(`Model ${config.model} not found on ${provider?.name || 'service'}`);
      }
      
      throw new Error(`${provider?.name || 'API'} request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error(`No response content from ${provider?.name || 'API'}`);
    }

    // Clean and parse the response
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Validate it's valid JSON
    try {
      const parsed = JSON.parse(cleanedContent);
      if (!parsed.findings || !Array.isArray(parsed.findings)) {
        throw new Error('Invalid response format');
      }
      return cleanedContent;
    } catch (parseError) {
      // If parsing fails, wrap the response in our expected format
      const fallbackResponse: AnalysisResponse = {
        findings: [{
          type: 'Suggestion',
          title: 'Analysis Complete',
          description: content,
          code: ''
        }]
      };
      return JSON.stringify(fallbackResponse);
    }
  }

  private async callClaude(code: string, systemInstruction: string, config: AIConfig): Promise<string> {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    };

    const requestBody = {
      model: config.model,
      max_tokens: 4000,
      temperature: 0.1,
      system: `${systemInstruction}\n\nYou must respond with valid JSON in this exact format: {"findings": [{"type": "Bug|Suggestion|Security|Style|Performance", "title": "Brief title", "description": "Detailed explanation", "code": "optional code snippet"}]}`,
      messages: [
        {
          role: 'user',
          content: `Please analyze the following code snippet:\n\`\`\`\n${code}\n\`\`\`\n\nRespond only with the JSON analysis, no additional text.`
        }
      ]
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid Claude API key');
      }
      if (response.status === 403) {
        throw new Error('Access forbidden for Claude API');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded for Claude API');
      }
      
      throw new Error(`Claude API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      throw new Error('No response content from Claude API');
    }

    // Clean and parse the response
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanedContent);
      if (!parsed.findings || !Array.isArray(parsed.findings)) {
        throw new Error('Invalid response format');
      }
      return cleanedContent;
    } catch (parseError) {
      const fallbackResponse: AnalysisResponse = {
        findings: [{
          type: 'Suggestion',
          title: 'Analysis Complete',
          description: content,
          code: ''
        }]
      };
      return JSON.stringify(fallbackResponse);
    }
  }

  async analyzeCode(code: string, systemInstruction: string, config: AIConfig): Promise<string> {
    if (!config.apiKey) {
      throw new Error(`API key is required for ${config.provider}`);
    }

    try {
      switch (config.provider) {
        case 'gemini':
          return await this.callGemini(code, systemInstruction, config);
        
        case 'claude':
          return await this.callClaude(code, systemInstruction, config);
        
        case 'openai':
        case 'sambanova':
        case 'cerebras':
        case 'openrouter':
          return await this.callOpenAICompatible(code, systemInstruction, config);
        
        default:
          throw new Error(`Unsupported AI provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error calling ${config.provider} API:`, error);
      throw error; // Re-throw the original error for better error handling
    }
  }
}
