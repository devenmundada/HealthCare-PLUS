import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('health_profiles')
export class HealthProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @OneToOne(() => User, user => user.health_profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true, length: 20 })
  gender: string;

  @Column({ nullable: true, length: 5 })
  blood_type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi: number;

  @Column({ type: 'text', nullable: true })
  medical_conditions: string;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  medications: string;

  @Column({ nullable: true, length: 100 })
  emergency_contact_name: string;

  @Column({ nullable: true, length: 20 })
  emergency_contact_phone: string;

  @Column({ nullable: true, length: 100 })
  insurance_provider: string;

  @Column({ nullable: true, length: 50 })
  insurance_id: string;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  health_metrics: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}