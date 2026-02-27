/**
 * Bed Allocation Service
 * Core intelligence for matching patients to beds
 */

import type { Bed, AdmissionRequirements, AllocationResult, BedReservation, AllocationMetrics } from '../types/allocation.types';

// Mock data (replace with DB queries later)
const mockBeds: Bed[] = [
  // ICU Beds
  {
    id: 'bed-001',
    hospitalId: 'hosp-001',
    bedNumber: 'ICU-101',
    specialty: 'Cardiology',
    type: 'ICU',
    ward: 'Cardiac Care Unit',
    floor: 3,
    status: 'available',
    equipment: ['ventilator', 'monitor', 'defibrillator', 'pacemaker'],
    isolationRequired: false,
    lastCleaned: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isPediatric: false,
  },
  {
    id: 'bed-002',
    hospitalId: 'hosp-001',
    bedNumber: 'ICU-102',
    specialty: 'Critical Care',
    type: 'ICU',
    ward: 'Intensive Care Unit',
    floor: 3,
    status: 'available',
    equipment: ['ventilator', 'monitor', 'defibrillator'],
    isolationRequired: true,
    lastCleaned: new Date(Date.now() - 1 * 60 * 60 * 1000),
    tags: ['negative-pressure'],
  },
  {
    id: 'bed-003',
    hospitalId: 'hosp-001',
    bedNumber: 'ICU-103',
    specialty: 'Neurology',
    type: 'ICU',
    ward: 'Neuro ICU',
    floor: 4,
    status: 'occupied',
    equipment: ['ventilator', 'monitor', 'EEG'],
    isolationRequired: false,
    currentPatientId: 'pat-456',
    estimatedVacancy: new Date(Date.now() + 12 * 60 * 60 * 1000),
    lastCleaned: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  // General Beds
  {
    id: 'bed-004',
    hospitalId: 'hosp-001',
    bedNumber: 'W-201',
    specialty: 'General Medicine',
    type: 'General',
    ward: 'General Ward',
    floor: 2,
    status: 'available',
    equipment: ['monitor'],
    isolationRequired: false,
    lastCleaned: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'bed-005',
    hospitalId: 'hosp-001',
    bedNumber: 'W-202',
    specialty: 'General Medicine',
    type: 'General',
    ward: 'General Ward',
    floor: 2,
    status: 'available',
    equipment: [],
    isolationRequired: false,
    lastCleaned: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isFemaleOnly: true,
  },
  {
    id: 'bed-006',
    hospitalId: 'hosp-001',
    bedNumber: 'W-203',
    specialty: 'Pediatrics',
    type: 'General',
    ward: 'Pediatric Ward',
    floor: 1,
    status: 'cleaning',
    equipment: ['monitor'],
    isolationRequired: false,
    lastCleaned: new Date(Date.now() - 30 * 60 * 1000),
    isPediatric: true,
  },
  // Emergency Beds
  {
    id: 'bed-007',
    hospitalId: 'hosp-001',
    bedNumber: 'ER-01',
    specialty: 'Emergency Medicine',
    type: 'Emergency',
    ward: 'Emergency Room',
    floor: 1,
    status: 'available',
    equipment: ['monitor', 'defibrillator', 'suction'],
    isolationRequired: false,
    lastCleaned: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: 'bed-008',
    hospitalId: 'hosp-001',
    bedNumber: 'ER-02',
    specialty: 'Emergency Medicine',
    type: 'Emergency',
    ward: 'Emergency Room',
    floor: 1,
    status: 'reserved',
    equipment: ['monitor', 'defibrillator'],
    isolationRequired: false,
    currentPatientId: 'pat-789',
    estimatedVacancy: new Date(Date.now() + 15 * 60 * 1000),
    lastCleaned: new Date(Date.now() - 15 * 60 * 1000),
  },
  // NICU
  {
    id: 'bed-009',
    hospitalId: 'hosp-001',
    bedNumber: 'NICU-01',
    specialty: 'Neonatology',
    type: 'NICU',
    ward: 'Neonatal ICU',
    floor: 3,
    status: 'available',
    equipment: ['incubator', 'monitor', 'ventilator'],
    isolationRequired: false,
    lastCleaned: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isPediatric: true,
  },
];

export class BedAllocationService {
  private beds: Bed[];

  constructor(beds: Bed[] = mockBeds) {
    this.beds = beds;
  }

  /**
   * Get all available beds (status = 'available' or 'reserved' with estimated vacancy soon)
   */
  private getAvailableBeds(): Bed[] {
    return this.beds.filter(bed => 
      bed.status === 'available' || 
      (bed.status === 'reserved' && bed.estimatedVacancy && bed.estimatedVacancy < new Date(Date.now() + 30 * 60 * 1000))
    );
  }

  /**
   * Score a bed against patient requirements (0-100)
   */
  private calculateMatchScore(bed: Bed, requirements: AdmissionRequirements): number {
    let score = 0;
    const weights = {
      specialtyMatch: 40,
      typeMatch: 25,
      equipmentMatch: 15,
      isolationMatch: 10,
      demographicMatch: 10,
    };

    // Specialty match (weight: 40)
    if (bed.specialty === requirements.specialty) {
      score += weights.specialtyMatch;
    } else {
      // Partial credit for related specialties
      const relatedSpecialties: Record<string, string[]> = {
        'Cardiology': ['Critical Care', 'Internal Medicine'],
        'Neurology': ['Critical Care', 'Neurosurgery'],
        'Pediatrics': ['Neonatology', 'General Medicine'],
        'Emergency Medicine': ['Critical Care', 'General Medicine'],
      };
      if (relatedSpecialties[requirements.specialty]?.includes(bed.specialty)) {
        score += weights.specialtyMatch * 0.5;
      }
    }

    // Bed type match (weight: 25)
    if (requirements.requiresIcu) {
      if (bed.type === 'ICU' || bed.type === 'NICU' || bed.type === 'CCU') {
        score += weights.typeMatch;
      } else if (bed.type === 'Emergency') {
        score += weights.typeMatch * 0.7; // Emergency can temporarily hold ICU
      }
    } else {
      if (bed.type === 'General') {
        score += weights.typeMatch;
      } else if (bed.type === 'Emergency') {
        score += weights.typeMatch * 0.5;
      }
    }

    // Equipment match (weight: 15)
    if (requirements.requiresVentilator) {
      if (bed.equipment.includes('ventilator')) {
        score += weights.equipmentMatch * 0.6;
      }
    } else {
      score += weights.equipmentMatch * 0.3; // Non-ventilator patients always get partial
    }

    // Additional equipment bonuses
    const requiredEquip = requirements.requiresVentilator ? ['ventilator'] : [];
    const matchingEquip = requiredEquip.filter(e => bed.equipment.includes(e)).length;
    const equipScore = (matchingEquip / Math.max(requiredEquip.length, 1)) * weights.equipmentMatch;
    score += equipScore;

    // Isolation requirements (weight: 10)
    if (requirements.requiresIsolation === bed.isolationRequired) {
      score += weights.isolationMatch;
    } else if (bed.tags?.includes('negative-pressure') && requirements.requiresNegativePressure) {
      score += weights.isolationMatch * 0.8;
    }

    // Demographic constraints (weight: 10)
    if (requirements.isPediatric && bed.isPediatric) {
      score += weights.demographicMatch * 0.5;
    }
    if (requirements.gender && bed.isFemaleOnly && requirements.gender === 'female') {
      score += weights.demographicMatch * 0.5;
    } else if (requirements.gender && bed.isFemaleOnly && requirements.gender !== 'female') {
      score -= weights.demographicMatch; // Penalty for wrong gender
    }

    // Penalty for beds that are reserved (but will be free soon)
    if (bed.status === 'reserved') {
      score *= 0.8;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Find the best bed for a patient based on requirements
   */
  async findBestBed(requirements: AdmissionRequirements): Promise<AllocationResult> {
    const availableBeds = this.getAvailableBeds();
    
    if (availableBeds.length === 0) {
      return {
        success: false,
        reason: 'No beds available',
        suggestedAction: 'wait',
        alternatives: [],
      };
    }

    // Score all available beds
    const scoredBeds = availableBeds.map(bed => ({
      bed,
      score: this.calculateMatchScore(bed, requirements),
    }));

    // Sort by score descending
    scoredBeds.sort((a, b) => b.score - a.score);

    // Get top 3 alternatives
    const alternatives = scoredBeds.slice(0, 3).map(sb => sb.bed);

    // If top score is below threshold, no good match
    if (scoredBeds.length === 0 || scoredBeds[0].score < 50) {
      // Check for emergency override (P1 only)
      if (requirements.priority === 1) {
        // For P1, take any bed that can stabilize patient
        const anyIcu = availableBeds.find(b => b.type === 'ICU' || b.type === 'Emergency');
        if (anyIcu) {
          return {
            success: true,
            bed: anyIcu,
            score: this.calculateMatchScore(anyIcu, requirements),
            alternatives,
            reason: 'Emergency override: P1 patient allocated to any ICU bed',
            suggestedAction: 'upgrade',
          };
        }
      }

      return {
        success: false,
        reason: 'No suitable bed found (match score below threshold)',
        suggestedAction: requirements.priority <= 2 ? 'transfer' : 'wait',
        alternatives,
      };
    }

    // Return best match
    return {
      success: true,
      bed: scoredBeds[0].bed,
      score: scoredBeds[0].score,
      alternatives: alternatives.slice(1),
      suggestedAction: scoredBeds[0].score > 80 ? undefined : 'downgrade',
    };
  }

  /**
   * Reserve a bed for a patient
   */
  async reserveBed(bedId: string, patientId: string, doctorId: string, duration?: number): Promise<BedReservation> {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }

    if (bed.status !== 'available' && bed.status !== 'reserved') {
      throw new Error(`Bed is not available (current status: ${bed.status})`);
    }

    // Update bed status
    bed.status = 'reserved';
    bed.currentPatientId = patientId;
    bed.estimatedVacancy = new Date(Date.now() + (duration || 4) * 60 * 60 * 1000); // Default 4 hours

    const reservation: BedReservation = {
      bedId,
      patientId,
      doctorId,
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minute reservation timeout
      estimatedDuration: duration,
    };

    // In real implementation, save to database
    console.log(`Bed ${bedId} reserved for patient ${patientId} by doctor ${doctorId}`);

    return reservation;
  }

  /**
   * Release a bed reservation (if patient doesn't show up)
   */
  async releaseReservation(bedId: string): Promise<void> {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }

    if (bed.status !== 'reserved') {
      throw new Error(`Bed is not reserved (current status: ${bed.status})`);
    }

    bed.status = 'available';
    bed.currentPatientId = undefined;
    bed.estimatedVacancy = undefined;

    console.log(`Bed ${bedId} released from reservation`);
  }

  /**
   * Occupy a bed (patient arrives)
   */
  async occupyBed(bedId: string, patientId: string): Promise<void> {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }

    if (bed.status !== 'reserved') {
      throw new Error(`Bed is not reserved (current status: ${bed.status})`);
    }

    if (bed.currentPatientId !== patientId) {
      throw new Error(`Bed reserved for different patient (expected: ${bed.currentPatientId})`);
    }

    bed.status = 'occupied';
    console.log(`Bed ${bedId} occupied by patient ${patientId}`);
  }

  /**
   * Start cleaning a bed (after discharge)
   */
  async startCleaning(bedId: string): Promise<void> {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }

    if (bed.status !== 'occupied') {
      throw new Error(`Bed is not occupied (current status: ${bed.status})`);
    }

    bed.status = 'cleaning';
    bed.currentPatientId = undefined;
    bed.lastCleaned = new Date();

    console.log(`Bed ${bedId} cleaning started`);
  }

  /**
   * Complete cleaning (bed becomes available)
   */
  async completeCleaning(bedId: string): Promise<void> {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }

    if (bed.status !== 'cleaning') {
      throw new Error(`Bed is not being cleaned (current status: ${bed.status})`);
    }

    bed.status = 'available';
    bed.estimatedVacancy = undefined;

    console.log(`Bed ${bedId} cleaning completed, now available`);
  }

  /**
   * Get allocation metrics
   */
  async getMetrics(): Promise<AllocationMetrics> {
    const totalBeds = this.beds.length;
    const availableBeds = this.beds.filter(b => b.status === 'available').length;
    const occupiedBeds = this.beds.filter(b => b.status === 'occupied').length;

    // Group by specialty for bottlenecks
    const specialtyMap = new Map<string, { total: number; occupied: number }>();
    this.beds.forEach(bed => {
      const current = specialtyMap.get(bed.specialty) || { total: 0, occupied: 0 };
      current.total++;
      if (bed.status === 'occupied') current.occupied++;
      specialtyMap.set(bed.specialty, current);
    });

    const bottlenecks = Array.from(specialtyMap.entries())
      .filter(([_, stats]) => stats.occupied / stats.total > 0.8) // >80% occupancy
      .map(([specialty, stats]) => ({
        specialty,
        waitCount: Math.round(stats.total * 0.2), // estimate
        avgWaitTime: 45, // placeholder, would come from real data
      }));

    return {
      totalBeds,
      availableBeds,
      occupancyRate: Math.round((occupiedBeds / totalBeds) * 100),
      avgAllocationTime: 3.5, // placeholder
      bottlenecks,
    };
  }
}

import { SocketService } from './socket.service';
import { BedUpdateData } from '../types/socket.types';

export class BedAllocationSocketService {
  private socketService: SocketService;
  private beds: Bed[];

  constructor(socketService: SocketService, beds: Bed[]) {
    this.socketService = socketService;
    this.beds = beds;
  }

  async reserveBed(bedId: string, patientId: string, doctorId: string, duration?: number) {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }
    bed.status = 'reserved';
    bed.currentPatientId = patientId;
    bed.estimatedVacancy = new Date(Date.now() + (duration || 4) * 60 * 60 * 1000); // Default 4 hours

    // Emit socket event
    const updateData: BedUpdateData = {
      bedId,
      status: 'reserved',
      patientId,
      patientName: `Patient-${patientId.substring(0, 8)}`,
      estimatedVacancy: bed.estimatedVacancy,
      updatedAt: new Date()
    };
    this.socketService.broadcastBedUpdate(updateData);

    // Return BedReservation structure to match BedAllocationService
    const reservation: BedReservation = {
      bedId,
      patientId,
      doctorId,
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minute reservation timeout, placeholder
      estimatedDuration: duration,
    };
    return reservation;
  }

  async occupyBed(bedId: string, patientId: string) {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }
    bed.status = 'occupied';
    bed.currentPatientId = patientId;
    const updateData: BedUpdateData = {
      bedId,
      status: 'occupied',
      patientId,
      patientName: `Patient-${patientId.substring(0, 8)}`,
      updatedAt: new Date()
    };
    this.socketService.broadcastBedUpdate(updateData);
  }

  async startCleaning(bedId: string) {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }
    bed.status = 'cleaning';
    bed.currentPatientId = undefined;
    bed.lastCleaned = new Date();
    // Optionally emit socket update for cleaning status
    const updateData: BedUpdateData = {
      bedId,
      status: 'cleaning',
      updatedAt: new Date(),
    };
    this.socketService.broadcastBedUpdate(updateData);
  }

  async completeCleaning(bedId: string) {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) {
      throw new Error('Bed not found');
    }
    bed.status = 'available';
    bed.estimatedVacancy = undefined;
    // Optionally emit socket update for available status
    const updateData: BedUpdateData = {
      bedId,
      status: 'available',
      updatedAt: new Date()
    };
    this.socketService.broadcastBedUpdate(updateData);
  }
}