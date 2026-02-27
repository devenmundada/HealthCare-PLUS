import { Request, Response } from 'express';

export class AIController {
  async getStatus(req: Request, res: Response) {
    try {
      // Check if Ollama is running
      const ollamaAvailable = process.env.OLLAMA_URL ? true : false;
      
      return res.json({
        success: true,
        data: {
          status: ollamaAvailable ? 'available' : 'unavailable',
          message: ollamaAvailable ? 'AI service is ready' : 'AI service not configured'
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async analyzeSymptoms(req: Request, res: Response) {
    try {
      const { symptoms, vitals } = req.body;
      
      // Mock response for now
      return res.json({
        success: true,
        data: {
          priority: 3,
          confidence: 75,
          suggestedSpecialty: 'General Medicine',
          redFlags: []
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}
