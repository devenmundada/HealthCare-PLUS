import { Request, Response } from 'express';
import { AppDataSource } from '../config/database.config';
import { Hospital } from '../entities/Hospital.entity';

function toApiShape(h: Hospital & { distance_km?: number }) {
  return {
    id: h.id,
    name: h.name,
    type: (h.type || 'private') as 'government' | 'private' | 'trust',
    address: h.address,
    city: h.city,
    state: h.state,
    pincode: h.pincode,
    latitude: Number(h.latitude),
    longitude: Number(h.longitude),
    lat: Number(h.latitude),
    lng: Number(h.longitude),
    phone: h.phone,
    emergency_phone: h.emergencyContact || h.phone,
    specialty: h.specialties && h.specialties.length ? h.specialties[0] : 'Multi-specialty',
    specialties: h.specialties || [],
    beds: h.totalBeds || 0,
    icu_beds: h.icuBeds || 0,
    ayushman_empaneled: !!h.ayushmanEmpaneled,
    rating: h.rating ? Number(h.rating) : 4.2,
    ...(h.distance_km !== undefined ? { distance_km: Math.round(h.distance_km * 10) / 10 } : {}),
  };
}

export class HospitalsController {
  private repo = AppDataSource.getRepository(Hospital);

  async getByCity(req: Request, res: Response) {
    try {
      const { city } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;

      const hospitals = await this.repo
        .createQueryBuilder('h')
        .where('h.city ILIKE :city', { city: `%${city}%` })
        .orderBy('h.totalBeds', 'DESC')
        .limit(limit)
        .getMany();

      return res.json({ success: true, count: hospitals.length, data: hospitals.map(toApiShape) });
    } catch (error) {
      console.error('getByCity error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getByState(req: Request, res: Response) {
    try {
      const { state } = req.params;
      const limit = parseInt(req.query.limit as string) || 30;

      const hospitals = await this.repo
        .createQueryBuilder('h')
        .where('h.state ILIKE :state', { state: `%${state}%` })
        .orderBy('h.city', 'ASC')
        .addOrderBy('h.totalBeds', 'DESC')
        .limit(limit)
        .getMany();

      return res.json({ success: true, count: hospitals.length, data: hospitals.map(toApiShape) });
    } catch (error) {
      console.error('getByState error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getNearby(req: Request, res: Response) {
    try {
      const { lat, lng } = req.query;
      const radius = parseFloat(req.query.radius as string) || 50;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!lat || !lng) {
        return res.status(400).json({ success: false, message: 'lat and lng are required' });
      }

      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);

      // Haversine distance in km, computed in SQL — works on plain Postgres, no PostGIS needed.
      const hospitals = await this.repo
        .createQueryBuilder('h')
        .select('h.*')
        .addSelect(
          `(6371 * acos(
              cos(radians(:lat)) * cos(radians(h.latitude)) *
              cos(radians(h.longitude) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(h.latitude))
          ))`,
          'distance_km'
        )
        .where('h.latitude IS NOT NULL AND h.longitude IS NOT NULL')
        .setParameters({ lat: latNum, lng: lngNum })
        .orderBy('distance_km', 'ASC')
        .limit(limit)
        .getRawMany();

      const filtered = hospitals
        .filter((row: any) => parseFloat(row.distance_km) <= radius)
        .map((row: any) =>
          toApiShape({
            ...row,
            id: row.id,
            distance_km: parseFloat(row.distance_km),
          } as any)
        );

      return res.json({ success: true, count: filtered.length, data: filtered });
    } catch (error) {
      console.error('getNearby error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const limit = parseInt(req.query.limit as string) || 20;

      const hospitals = await this.repo
        .createQueryBuilder('h')
        .where('h.name ILIKE :q OR h.city ILIKE :q OR h.state ILIKE :q', { q: `%${q}%` })
        .limit(limit)
        .getMany();

      return res.json({ success: true, count: hospitals.length, data: hospitals.map(toApiShape) });
    } catch (error) {
      console.error('search error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getStates(req: Request, res: Response) {
    try {
      const rows = await this.repo
        .createQueryBuilder('h')
        .select('DISTINCT h.state', 'state')
        .where('h.state IS NOT NULL')
        .orderBy('h.state', 'ASC')
        .getRawMany();
      return res.json({ success: true, data: rows.map((r) => r.state) });
    } catch (error) {
      console.error('getStates error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getCitiesByState(req: Request, res: Response) {
    try {
      const { state } = req.params;
      const rows = await this.repo
        .createQueryBuilder('h')
        .select('DISTINCT h.city', 'city')
        .where('h.state ILIKE :state', { state: `%${state}%` })
        .orderBy('h.city', 'ASC')
        .getRawMany();
      return res.json({ success: true, data: rows.map((r) => r.city) });
    } catch (error) {
      console.error('getCitiesByState error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getHospital(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid hospital id' });
      }
      const hospital = await this.repo.findOne({ where: { id } });
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }
      return res.json({ success: true, data: toApiShape(hospital) });
    } catch (error) {
      console.error('getHospital error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}
