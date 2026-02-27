import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
  } from 'typeorm';
  import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';
  import * as bcrypt from 'bcryptjs';
  import { AuditLog } from './AuditLog';
  import { Patient } from './Patient';
  
  export enum UserRole {
    ADMIN = 'admin',
    DOCTOR = 'doctor',
    RADIOLOGIST = 'radiologist',
    NURSE = 'nurse',
    TECHNICIAN = 'technician',
    PATIENT = 'patient',
  }
  
  export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING_VERIFICATION = 'pending_verification',
  }
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    @IsEmail({}, { message: 'Invalid email address' })
    email: string;
  
    @Column({ select: false })
    @IsNotEmpty()
    @Length(8, 100)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    })
    password: string;
  
    @Column()
    @IsNotEmpty()
    @Length(2, 100)
    firstName: string;
  
    @Column()
    @IsNotEmpty()
    @Length(2, 100)
    lastName: string;
  
    @Column({ type: 'enum', enum: UserRole, default: UserRole.DOCTOR })
    role: UserRole;
  
    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
    status: UserStatus;
  
    @Column({ nullable: true })
    specialization?: string;
  
    @Column({ nullable: true })
    licenseNumber?: string;
  
    @Column({ nullable: true })
    hospitalAffiliation?: string;
  
    @Column({ nullable: true })
    phoneNumber?: string;
  
    @Column({ default: false })
    isTwoFactorEnabled: boolean;
  
    @Column({ nullable: true, select: false })
    twoFactorSecret?: string;
  
    @Column({ nullable: true })
    lastLoginAt?: Date;
  
    @Column({ nullable: true })
    passwordChangedAt?: Date;
  
    @Column({ nullable: true, select: false })
    passwordResetToken?: string;
  
    @Column({ nullable: true, select: false })
    passwordResetExpires?: Date;
  
    @Column({ nullable: true })
    emailVerifiedAt?: Date;
  
    @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
    auditLogs: AuditLog[];
  
    @OneToMany(() => Patient, (patient) => patient.createdBy)
    patients: Patient[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
      if (this.password) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }
  
    async comparePassword(candidatePassword: string): Promise<boolean> {
      return bcrypt.compare(candidatePassword, this.password);
    }
  
    fullName(): string {
      return `${this.firstName} ${this.lastName}`;
    }
  
    isActive(): boolean {
      return this.status === UserStatus.ACTIVE;
    }
  
    isVerified(): boolean {
      return !!this.emailVerifiedAt;
    }
  
    toJSON() {
      const { password, twoFactorSecret, passwordResetToken, passwordResetExpires, ...user } = this;
      return user;
    }
  }