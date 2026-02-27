import { DataSource, EntityTarget } from 'typeorm';
import { config } from 'dotenv';

config();

// Use 'any' temporarily to bypass strict type checking
let entities: any[] = [];

try {
  // Using dynamic require to avoid import errors if the entities don't exist yet
  const Doctor = require('../entities/Doctor.entity').Doctor;
  const Patient = require('../entities/Patient.entity').Patient;
  const Hospital = require('../entities/Hospital.entity').Hospital;
  const DoctorHospital = require('../entities/DoctorHospital.entity').DoctorHospital;
  const Bed = require('../entities/Bed.entity').Bed;
  const Appointment = require('../entities/Appointment.entity').Appointment;
  const Admission = require('../entities/Admission.entity').Admission;
  const Notification = require('../entities/Notification.entity').Notification;
  const DoctorAvailability = require('../entities/DoctorAvailability.entity').DoctorAvailability;
  const WaitTimeSample = require('../entities/WaitTimeSample.entity').WaitTimeSample;
  const User = require('../entities/User.entity').User;

  // Filter out any undefined values
  entities = [
    Doctor,
    Patient,
    Hospital,
    DoctorHospital,
    Bed,
    Appointment,
    Admission,
    Notification,
    DoctorAvailability,
    WaitTimeSample,
    User
  ].filter(entity => entity !== undefined);
  
  console.log(`✅ Loaded ${entities.length} entities successfully`);
} catch (error: unknown) {
  if (error instanceof Error) {
    console.warn('⚠️ Some entities could not be loaded:', error.message);
  } else {
    console.warn('⚠️ Some entities could not be loaded');
  }
  console.log('Will continue with empty entity list - tables should already exist');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'healthcare_db',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: entities,
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
