import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DoctorHospital } from './DoctorHospital.entity';
import { Bed } from './Bed.entity';
import { Admission } from './Admission.entity';

@Entity('indian_hospitals')
export class Hospital {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  state: string;

  @Column({ length: 10, nullable: true })
  pincode: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'total_beds', nullable: true })
  totalBeds: number;

  @Column({ name: 'icu_beds', nullable: true })
  icuBeds: number;

  @Column({ name: 'emergency_contact', length: 20, nullable: true })
  emergencyContact: string;

  @Column('text', { array: true, nullable: true })
  specialties: string[];

  @Column('jsonb', { nullable: true })
  metadata: any;

  // Relations
  @OneToMany(() => DoctorHospital, doctorHospital => doctorHospital.hospital)
  doctors: DoctorHospital[];

  @OneToMany(() => Bed, bed => bed.hospital)
  beds: Bed[];

  @OneToMany(() => Admission, admission => admission.hospital)
  admissions: Admission[];
}
