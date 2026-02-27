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
  import { IsNotEmpty, IsEnum, IsUrl } from 'class-validator';
  import { Patient } from './Patient';
  import { AnalysisResult } from './AnalysisResult';
  
  export enum ImageModality {
    XRAY = 'xray',
    CT = 'ct',
    MRI = 'mri',
    ULTRASOUND = 'ultrasound',
    MAMMOGRAM = 'mammogram',
    PET = 'pet',
    OTHER = 'other',
  }
  
  export enum ImageStatus {
    UPLOADING = 'uploading',
    UPLOADED = 'uploaded',
    PROCESSING = 'processing',
    ANALYZED = 'analyzed',
    FAILED = 'failed',
  }
  
  @Entity('medical_images')
  export class MedicalImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Patient, (patient) => patient.medicalImages, { onDelete: 'CASCADE' })
    patient: Patient;
  
    @Column()
    @IsNotEmpty()
    studyUid: string; // DICOM Study Instance UID
  
    @Column()
    @IsNotEmpty()
    seriesUid: string; // DICOM Series Instance UID
  
    @Column({ unique: true })
    @Index()
    @IsNotEmpty()
    imageUid: string; // DICOM SOP Instance UID
  
    @Column({ type: 'enum', enum: ImageModality })
    @IsEnum(ImageModality)
    modality: ImageModality;
  
    @Column({ nullable: true })
    bodyPart?: string;
  
    @Column({ type: 'date', nullable: true })
    studyDate?: Date;
  
    @Column({ nullable: true })
    studyDescription?: string;
  
    @Column()
    @IsUrl()
    s3Key: string; // S3 object key
  
    @Column()
    @IsUrl()
    s3Url: string; // Presigned URL for access
  
    @Column({ type: 'jsonb' })
    metadata: {
      width: number;
      height: number;
      bitsAllocated: number;
      bitsStored: number;
      pixelRepresentation: number;
      photometricInterpretation: string;
      [key: string]: any;
    };
  
    @Column({ type: 'bigint' })
    fileSize: number; // in bytes
  
    @Column()
    mimeType: string;
  
    @Column({ type: 'enum', enum: ImageStatus, default: ImageStatus.UPLOADING })
    status: ImageStatus;
  
    @Column({ nullable: true })
    uploadedBy?: string;
  
    @Column({ type: 'jsonb', nullable: true })
    uploadProgress?: {
      total: number;
      uploaded: number;
      percentage: number;
    };
  
    @OneToMany(() => AnalysisResult, (result) => result.image)
    analysisResults: AnalysisResult[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    getFileSizeMB(): number {
      return this.fileSize / (1024 * 1024);
    }
  
    getFileSizeFormatted(): string {
      const sizeInMB = this.getFileSizeMB();
      if (sizeInMB < 1) {
        return `${Math.round(this.fileSize / 1024)} KB`;
      }
      return `${sizeInMB.toFixed(2)} MB`;
    }
  
    isProcessable(): boolean {
      return this.status === ImageStatus.UPLOADED;
    }
  
    toJSON() {
      return {
        ...this,
        fileSizeMB: this.getFileSizeMB(),
        fileSizeFormatted: this.getFileSizeFormatted(),
      };
    }
  }