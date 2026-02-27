import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    Index,
  } from 'typeorm';
  import { IsNotEmpty, IsDate, Min, Max, IsEnum } from 'class-validator';
  import { User } from './User';
  import { MedicalImage } from './MedicalImage';
  import { ClinicalNote } from './ClinicalNote';
  
  export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    UNKNOWN = 'unknown',
  }
  
  @Entity('patients')
  export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    @Index()
    @IsNotEmpty()
    mrn: string; // Medical Record Number
  
    @Column()
    @IsNotEmpty()
    firstName: string;
  
    @Column()
    @IsNotEmpty()
    lastName: string;
  
    @Column({ type: 'date' })
    @IsDate()
    dateOfBirth: Date;
  
    @Column({ type: 'enum', enum: Gender, default: Gender.UNKNOWN })
    @IsEnum(Gender)
    gender: Gender;
  
    @Column({ type: 'integer', nullable: true })
    @Min(0)
    @Max(150)
    age?: number;
  
    @Column({ type: 'bytea', nullable: true })
    encryptedSsn?: Buffer; // Encrypted Social Security Number
  
    @Column({ nullable: true })
    phoneNumber?: string;
  
    @Column({ nullable: true })
    email?: string;
  
    @Column({ type: 'jsonb', nullable: true })
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  
    @Column({ type: 'jsonb', nullable: true })
    emergencyContact?: {
      name: string;
      relationship: string;
      phoneNumber: string;
      email?: string;
    };
  
    @Column({ type: 'jsonb', nullable: true })
    insuranceInfo?: {
      provider: string;
      policyNumber: string;
      groupNumber?: string;
      effectiveDate: Date;
      expirationDate?: Date;
    };
  
    @Column({ type: 'jsonb', default: [] })
    medicalHistory: string[];
  
    @Column({ type: 'jsonb', default: [] })
    allergies: string[];
  
    @Column({ type: 'jsonb', default: [] })
    currentMedications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      prescriber?: string;
    }>;
  
    @Column({ default: true })
    isActive: boolean;
  
    @ManyToOne(() => User, (user) => user.patients)
    createdBy: User;
  
    @OneToMany(() => MedicalImage, (image) => image.patient)
    medicalImages: MedicalImage[];
  
    @OneToMany(() => ClinicalNote, (note) => note.patient)
    clinicalNotes: ClinicalNote[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column({ nullable: true })
    deletedAt?: Date;
  
    fullName(): string {
      return `${this.firstName} ${this.lastName}`;
    }
  
    calculateAge(): number {
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    }
  
    toJSON() {
      const { encryptedSsn, deletedAt, ...patient } = this;
      return {
        ...patient,
        age: this.calculateAge(),
      };
    }
  }