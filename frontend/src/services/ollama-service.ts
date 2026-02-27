import axios from 'axios';

const OLLAMA_BASE_URL = 'http://localhost:11434/api';

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
  };
}

class OllamaService {
  private isAvailable: boolean = false;
  private model: string = 'phi3:mini';
  private useProxy: boolean = true; // Prefer backend proxy for better CORS handling

  constructor() {
    this.checkAvailability();
  }

  async checkAvailability(): Promise<boolean> {
    try {
      // First check backend proxy
      if (this.useProxy) {
        try {
          const proxyStatus = await axios.get('http://localhost:3001/api/ai/status', { timeout: 3000 });
          if (proxyStatus.data.available) {
            this.isAvailable = true;
            console.log('✅ Backend AI proxy is available');
            return true;
          }
        } catch (proxyError) {
          console.log('Backend proxy not available, checking direct Ollama...');
        }
      }

      // Fallback to direct Ollama check
      await axios.get(`${OLLAMA_BASE_URL}/tags`, { timeout: 3000 });
      this.isAvailable = true;
      console.log('✅ Ollama server is available (direct connection)');
      return true;
    } catch (error) {
      console.warn('⚠️ AI service not available, using fallback mode');
      this.isAvailable = false;
      return false;
    }
  }

  // Main generate method - tries proxy first, then direct Ollama, then fallback
  async generate(prompt: string, medicalContext: boolean = true): Promise<string> {
    try {
      // Try backend proxy first (better CORS handling)
      if (this.useProxy) {
        try {
          const proxyResponse = await this.generateWithProxy(prompt);
          console.log('Generated via backend proxy');
          return proxyResponse;
        } catch (proxyError) {
          console.log('Backend proxy failed, trying direct Ollama...');
        }
      }

      // Try direct Ollama connection
      if (this.isAvailable) {
        try {
          const directResponse = await this.generateDirect(prompt, medicalContext);
          console.log('Generated via direct Ollama');
          return directResponse;
        } catch (directError) {
          console.error('Direct Ollama failed:', directError);
        }
      }

      // Fallback to predefined responses
      return this.fallbackResponse(prompt);
    } catch (error) {
      console.error('All AI generation methods failed:', error);
      return this.fallbackResponse(prompt);
    }
  }

  // Generate using backend proxy
  async generateWithProxy(prompt: string): Promise<string> {
    try {
      const response = await axios.post('http://localhost:3001/api/ai/chat', {
        message: prompt
      }, {
        timeout: 30000
      });
      
      if (response.data.success) {
        return this.formatMedicalResponse(response.data.response);
      } else {
        throw new Error('Backend proxy returned error');
      }
    } catch (error) {
      console.error('Backend proxy failed:', error);
      throw error;
    }
  }

  // Generate directly via Ollama API
  private async generateDirect(prompt: string, medicalContext: boolean): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Ollama not available');
    }

    // Enhance prompt with medical context
    const enhancedPrompt = medicalContext
      ? this.addMedicalContext(prompt)
      : prompt;

    const request: OllamaRequest = {
      model: this.model,
      prompt: enhancedPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 500
      }
    };

    const response = await axios.post<OllamaResponse>(
      `${OLLAMA_BASE_URL}/generate`,
      request,
      { timeout: 30000 }
    );

    return this.formatMedicalResponse(response.data.response);
  }

  private addMedicalContext(prompt: string): string {
    return `You are Healthcare+ AI Assistant, a certified medical AI assistant for Indian users. Provide accurate, helpful, and safe medical information.

IMPORTANT DISCLAIMER: I am an AI assistant and not a substitute for professional medical advice. Always consult with qualified healthcare providers for medical concerns.

User Query: "${prompt}"

Please respond with:
1. Clear, concise medical information
2. Relevant to Indian healthcare context
3. Practical advice
4. When to seek immediate medical attention
5. Suggest Indian healthcare resources if applicable

Response:`;
  }

  private formatMedicalResponse(response: string): string {
    // Format response with markdown-like styling
    let formatted = response
      .replace(/Disclaimer:/gi, '**⚠️ Disclaimer:**')
      .replace(/Important:/gi, '**📌 Important:**')
      .replace(/Symptoms:/gi, '**🤒 Symptoms:**')
      .replace(/Treatment:/gi, '**💊 Treatment:**')
      .replace(/Prevention:/gi, '**🛡️ Prevention:**')
      .replace(/When to see a doctor:/gi, '**🏥 When to see a doctor:**')
      .replace(/Emergency signs:/gi, '**🚨 Emergency signs:**');

    // Add disclaimer if not present
    if (!formatted.includes('⚠️ Disclaimer')) {
      formatted = `**⚠️ Disclaimer:** I am an AI assistant and not a substitute for professional medical advice. Always consult with qualified healthcare providers for medical concerns.\n\n${formatted}`;
    }

    return formatted;
  }

  private fallbackResponse(prompt: string): string {
    // Import or define medical knowledge base
    const medicalKnowledge: Record<string, string> = {
      'fever': `**🤒 Fever Symptoms & Management**

**Common Symptoms:**
• Elevated body temperature (>100.4°F or 38°C)
• Chills and shivering
• Headache
• Muscle aches
• Loss of appetite
• Dehydration
• General weakness

**Home Care:**
1. **Rest**: Get plenty of sleep and avoid physical exertion
2. **Hydration**: Drink water, oral rehydration solutions, or clear broths
3. **Medication**: Paracetamol (Crocin) or Ibuprofen as directed
4. **Cool Compress**: Apply damp cloth to forehead and wrists
5. **Light Clothing**: Wear light, breathable fabrics

**🛑 When to Seek Medical Attention:**
• Fever above 103°F (39.4°C)
• Lasting more than 3 days
• Difficulty breathing
• Severe headache or stiff neck
• Rash that doesn't fade under pressure
• In infants under 3 months

**🏥 Indian Context:**
• Consult your physician for proper diagnosis
• Common causes: Viral infections, dengue, malaria (in endemic areas)
• Get tested if fever persists beyond 48 hours

**⚠️ Disclaimer**: This is general information. Consult a doctor for proper diagnosis and treatment.`,

      'headache': `**🤕 Headache Relief & Management**

**Types & Symptoms:**
• **Tension Headache**: Band-like pressure around head
• **Migraine**: Throbbing pain, often with nausea, light sensitivity
• **Cluster Headache**: Severe pain around one eye

**Immediate Relief:**
1. **Rest in dark, quiet room**
2. **Cold compress** on forehead
3. **Hydrate** with water
4. **Gentle massage** of temples and neck
5. **Over-the-counter**: Paracetamol, Ibuprofen (as directed)

**Prevention Tips:**
• Maintain regular sleep schedule
• Stay hydrated (2-3 liters daily)
• Manage stress through meditation/yoga
• Regular exercise
• Avoid trigger foods (chocolate, cheese, processed meats)

**🚨 Emergency Signs (Seek Immediate Care):**
• "Worst headache of your life"
• Sudden, severe headache
• Headache with fever, stiff neck, confusion
• Headache after head injury
• Headache with vision changes or weakness

**🏥 Indian Healthcare Tips:**
• Ayurvedic options: Shirodhara, Nasya (consult Ayurvedic doctor)
• Yoga: Pranayama, Shavasana for stress relief
• Consult neurologist for chronic headaches`,

      'cough': `**🤧 Cough Management & Relief**

**Types of Cough:**
• **Dry Cough**: Tickling sensation, no phlegm
• **Wet/Productive Cough**: Produces mucus/phlegm
• **Chronic Cough**: Lasts more than 8 weeks

**Home Remedies:**
1. **Honey & Warm Water**: 1-2 tsp honey in warm water
2. **Steam Inhalation**: Add few drops eucalyptus oil
3. **Salt Water Gargle**: ½ tsp salt in warm water
4. **Turmeric Milk**: Golden milk with black pepper
5. **Stay Hydrated**: Warm liquids throughout day

**Medical Treatment:**
• **Expectorants**: Guaifenesin (for productive cough)
• **Suppressants**: Dextromethorphan (for dry cough)
• **Antihistamines**: For allergy-related cough
• **Inhalers**: For asthma-related cough

**🏥 When to See Doctor:**
• Cough lasting more than 3 weeks
• Coughing up blood
• Shortness of breath or wheezing
• Fever above 101°F (38.3°C)
• Unexplained weight loss

**Indian Traditional Remedies:**
• Tulsi (Holy Basil) leaves with honey
• Adulsa (Vasaka) leaf extract
• Mulethi (Licorice) root tea
• **Note**: Consult Ayurvedic practitioner for proper guidance`
    };

    // Check for specific medical terms
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('fever')) {
      return medicalKnowledge.fever;
    } else if (lowerPrompt.includes('headache')) {
      return medicalKnowledge.headache;
    } else if (lowerPrompt.includes('cough') || lowerPrompt.includes('cold')) {
      return medicalKnowledge.cough;
    }

    // Generic fallback
    const fallbacks = [
      `I understand you're asking about "${prompt}". While I recommend consulting with a healthcare professional for accurate medical advice, here's some general information...\n\n**Note:** For immediate concerns, please contact your doctor or visit the nearest hospital.`,
      `Thank you for your question about "${prompt}". For personalized medical advice, I recommend scheduling an appointment with one of our verified doctors through the Doctors page.`,
      `I'd love to help with "${prompt}". For the most accurate medical information, please consult with a healthcare provider. In the meantime, you can search for related symptoms or conditions in our database.`
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${OLLAMA_BASE_URL}/tags`);
      return response.data.models.map((model: any) => model.name);
    } catch (error) {
      return [];
    }
  }

  // Set model preference
  setModel(model: string): void {
    this.model = model;
  }

  // Toggle proxy usage
  setUseProxy(useProxy: boolean): void {
    this.useProxy = useProxy;
  }

  // Get current status
  getStatus(): { available: boolean; model: string; usingProxy: boolean } {
    return {
      available: this.isAvailable,
      model: this.model,
      usingProxy: this.useProxy
    };
  }
}

export const ollamaService = new OllamaService();