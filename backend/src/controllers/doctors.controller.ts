import { Request, Response } from 'express';
import { AppDataSource } from '../config/database.config';
import { Doctor } from '../entities/Doctor.entity';

export class DoctorsController {
  private doctorRepository = AppDataSource.getRepository(Doctor);

  async getAllDoctors(req: Request, res: Response) {
    try {
      console.log('📊 Fetching all doctors from database...');
      
      const doctors = await this.doctorRepository.find();
      
      console.log(`✅ Found ${doctors.length} doctors`);
      
      return res.json({
        success: true,
        data: {
          doctors: doctors,
          total: doctors.length,
          limit: 20,
          offset: 0
        }
      });
      
    } catch (error) {
      console.error('❌ Get doctors error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error'
      });
    }
  }

  async getDoctorById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      // Check if id is a valid number
      if (isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid doctor ID' 
        });
      }

      const doctor = await this.doctorRepository.findOne({
        where: { id }
      });

      if (!doctor) {
        return res.status(404).json({ 
          success: false, 
          error: 'Doctor not found' 
        });
      }

      return res.json({ 
        success: true, 
        data: doctor 
      });
    } catch (error) {
      console.error('❌ Get doctor error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  async getAllSpecialties(req: Request, res: Response) {
    try {
      console.log('🔍 Fetching all specialties...');
      
      const doctors = await this.doctorRepository.find();
      
      // Extract unique specialties and filter out null/undefined
      const specialties = [...new Set(
        doctors
          .map(d => d.specialty)
          .filter(s => s && s.trim() !== '')
      )];
      
      console.log(`✅ Found ${specialties.length} unique specialties`);
      
      return res.json({ 
        success: true, 
        data: specialties 
      });
    } catch (error) {
      console.error('❌ Get specialties error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }

  async getAvailableDoctors(req: Request, res: Response) {
    try {
      const { specialty } = req.query;
      
      let doctors = await this.doctorRepository.find();
      
      // Filter by specialty if provided
      if (specialty && typeof specialty === 'string') {
        doctors = doctors.filter(d => d.specialty === specialty);
      }
      
      // Transform to available doctors format
      const transformedDoctors = doctors.map(doc => ({
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty,
        consultationFee: doc.consultationFee,
        rating: doc.rating,
        isAvailable: true
      }));

      return res.json({ 
        success: true, 
        data: transformedDoctors 
      });
    } catch (error) {
      console.error('❌ Get available doctors error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
}
