import { Request, Response } from 'express';
import { BedAllocationService } from '../services/bed-allocation.service';

const allocationService = new BedAllocationService();

export class BedsController {
  /**
   * GET /api/beds
   * Get all beds with optional filters
   */
  async getAllBeds(req: Request, res: Response) {
    try {
      const { specialty, status, type } = req.query;
      
      // Access the beds from the service (we need to expose them)
      const beds = (allocationService as any).beds || [];
      
      let filteredBeds = [...beds];
      
      if (specialty) {
        filteredBeds = filteredBeds.filter(b => b.specialty === specialty);
      }
      if (status) {
        filteredBeds = filteredBeds.filter(b => b.status === status);
      }
      if (type) {
        filteredBeds = filteredBeds.filter(b => b.type === type);
      }
      
      return res.json({
        success: true,
        data: filteredBeds,
      });
    } catch (error) {
      console.error('Get beds error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/beds/:id
   * Get bed by ID
   */
  async getBedById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const beds = (allocationService as any).beds || [];
      const bed = beds.find((b: any) => b.id === id);
      
      if (!bed) {
        return res.status(404).json({
          success: false,
          error: 'Bed not found',
        });
      }
      
      return res.json({
        success: true,
        data: bed,
      });
    } catch (error) {
      console.error('Get bed error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/beds/stats
   * Get bed statistics
   */
  async getBedStats(req: Request, res: Response) {
    try {
      const metrics = await allocationService.getMetrics();
      
      return res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      console.error('Get bed stats error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}