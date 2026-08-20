import { Request, Response } from 'express';
import { In } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { Doctor } from '../entities/Doctor.entity';
import { Hospital } from '../entities/Hospital.entity';

export class DoctorsController {
  private doctorRepository = AppDataSource.getRepository(Doctor);
  private hospitalRepository = AppDataSource.getRepository(Hospital);

  // Attach real hospital name/city/state to each doctor instead of leaving the
  // frontend to fall back to hardcoded placeholder hospital data.
  private async withHospitalInfo(doctors: Doctor[]) {
    const hospitalIds = [...new Set(doctors.map((d) => d.hospitalId).filter(Boolean))] as number[];
    const hospitals = hospitalIds.length
      ? await this.hospitalRepository.findBy({ id: In(hospitalIds) })
      : [];
    const hospitalById = new Map(hospitals.map((h) => [h.id, h]));

    return doctors.map((doc) => {
      const hospital = doc.hospitalId ? hospitalById.get(doc.hospitalId) : undefined;
      return {
        ...doc,
        hospital_name: hospital?.name || null,
        hospital_city: hospital?.city || null,
        hospital_state: hospital?.state || null,
      };
    });
  }

  async getAllDoctors(req: Request, res: Response) {
    try {
      console.log('📊 Fetching all doctors from database...');

      const { specialty, city } = req.query;
      let doctors = await this.doctorRepository.find();

      if (specialty && typeof specialty === 'string') {
        doctors = doctors.filter((d) => d.specialty === specialty);
      }

      let enriched = await this.withHospitalInfo(doctors);

      if (city && typeof city === 'string') {
        enriched = enriched.filter(
          (d) => d.hospital_city && d.hospital_city.toLowerCase().includes(city.toLowerCase())
        );
      }

      console.log(`✅ Found ${enriched.length} doctors`);

      return res.json({
        success: true,
        data: {
          doctors: enriched,
          total: enriched.length,
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

      const [enriched] = await this.withHospitalInfo([doctor]);

      return res.json({
        success: true,
        data: enriched
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
