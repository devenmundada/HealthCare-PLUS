import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Appointment } from './Appointment.entity';
import { DoctorHospital } from './DoctorHospital.entity';
import { Admission } from './Admission.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  specialty: string;

  @Column('text', { array: true, nullable: true })
  qualification: string[];

  @Column({ name: 'experience_years' })
  experienceYears: number;

  @Column({ name: 'hospital_id', nullable: true })
  hospitalId: number;

  @Column({ name: 'consultation_fee', type: 'decimal', precision: 8, scale: 2, nullable: true })
  consultationFee: number;

  @Column('text', { array: true, nullable: true, name: 'languages' })
  languages: string[];

  @Column('decimal', { precision: 3, scale: 2, nullable: true, name: 'rating' })
  rating: number;

  @Column({ name: 'review_count', nullable: true, default: 0 })
  reviewCount: number;

  @Column({ name: 'patient_count', nullable: true, default: 0 })
  patientCount: number;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ name: 'profile_image_url', length: 255, nullable: true })
  profileImageUrl: string;

  @Column({ name: 'is_verified', nullable: true, default: true })
  isVerified: boolean;

  @Column({ name: 'available_days', type: 'text', array: true, nullable: true })
  availableDays: string[];

  @Column({ name: 'available_hours', length: 100, nullable: true })
  availableHours: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => DoctorHospital, doctorHospital => doctorHospital.doctor)
  hospitalLinks: DoctorHospital[];

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => Admission, admission => admission.doctor)
  admissions: Admission[];
}
