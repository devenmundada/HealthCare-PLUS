/**
 * Command Center - Hospital Operating System Dashboard
 * Tabbed interface for bed management, triage, ambulances, doctor status, and analytics
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useBedStatus } from '../../contexts/BedStatusContext';
import { Container } from '../../components/layout/Container';
import { EmergencyAlertBanner } from './EmergencyAlertBanner';
import { DashboardHeader } from './DashboardHeader';
import { QuickStatsBar } from './QuickStatsBar';
import { DashboardTabs } from './DashboardTabs';
import { OverviewTab } from './OverviewTab';
import { BedsTab } from './BedsTab';
import { TriageTab } from './TriageTab';
import { AmbulancesTab } from './AmbulancesTab';
import { DoctorsTab } from './DoctorsTab';
import { AnalyticsTab } from './AnalyticsTab';
import type { DashboardTab } from './types';
import type { DoctorStatus } from '../../types/bed.types';
import { MOCK_TRIAGE_PATIENTS } from '../../mocks/triage';
import { MOCK_AMBULANCES } from '../../mocks/ambulances';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface ApiDoctor {
  id: number;
  name: string;
  specialty: string;
  isAvailable: boolean;
  isEmergencyAvailable: boolean;
  currentPatients: number;
  maxPatients: number;
  consultationFee?: number;
  rating?: number;
  experienceYears?: number;
  languages?: string[];
  phone?: string;
  email?: string;
  profileImageUrl?: string;
}

export const Dashboard: React.FC = () => {
  const {
    beds,
    metrics,
    bySpecialty,
    connectionStatus,
    lastUpdated,
    filterSpecialty,
    setFilterSpecialty,
    refresh,
  } = useBedStatus();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(true);
  const [doctors, setDoctors] = useState<DoctorStatus[]>([]);

  // Fetch real doctors from API and transform to DoctorStatus type
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${API_URL}/doctors`);
        if (response.data.success) {
          const apiDoctors: ApiDoctor[] = response.data.data?.doctors || [];
          
          // Transform API doctors to match DoctorStatus type
          const transformedDoctors: DoctorStatus[] = apiDoctors.map(doc => ({
            id: doc.id.toString(),
            name: doc.name,
            specialty: doc.specialty,
            isOnDuty: doc.isAvailable || false,
            isEmergencyAvailable: doc.isEmergencyAvailable || false,
            currentPatients: doc.currentPatients || 0,
            maxPatients: doc.maxPatients || 10,
            nextAvailable: undefined,
          }));
          
          setDoctors(transformedDoctors);
        }
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  const emergencyStats = {
    p1Patients: MOCK_TRIAGE_PATIENTS.filter((p) => p.priority === 1).length,
    incomingAmbulances: MOCK_AMBULANCES.filter((a) => a.status === 'enroute').length,
    availableEmergencyBeds: beds.filter((b) => b.type === 'Emergency' && b.status === 'available').length,
    criticalDoctors: doctors.filter((d) => d.isEmergencyAvailable).length,
  };

  const handleAssignDoctor = useCallback((patientId: string, doctorId: string) => {
    console.log('Assign doctor', patientId, doctorId);
  }, []);

  const handleViewPatientDetails = useCallback((patientId: string) => {
    console.log('View patient', patientId);
  }, []);

  const handleCallDoctor = useCallback((doctorId: string) => {
    console.log('Call doctor', doctorId);
  }, []);

  const handleViewDoctorSchedule = useCallback((doctorId: string) => {
    console.log('View schedule', doctorId);
  }, []);

  const handleAmbulanceSelect = useCallback((ambulanceId: string) => {
    console.log('Selected ambulance', ambulanceId);
  }, []);

  const handleDispatchAmbulance = useCallback((ambulanceId: string, hospitalId: string) => {
    console.log('Dispatch ambulance', ambulanceId, 'to', hospitalId);
  }, []);

  return (
    <div className="min-h-screen py-6 bg-background-primary">
      <Container>
        {showEmergencyAlert && emergencyStats.p1Patients > 0 && (
          <EmergencyAlertBanner
            p1Count={emergencyStats.p1Patients}
            incomingAmbulances={emergencyStats.incomingAmbulances}
            availableErBeds={emergencyStats.availableEmergencyBeds}
            criticalDoctors={emergencyStats.criticalDoctors}
            onDismiss={() => setShowEmergencyAlert(false)}
          />
        )}

        <DashboardHeader
          connectionStatus={connectionStatus}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />

        <QuickStatsBar
          p1Patients={emergencyStats.p1Patients}
          incomingAmbulances={emergencyStats.incomingAmbulances}
          availableEmergencyBeds={emergencyStats.availableEmergencyBeds}
          criticalDoctors={emergencyStats.criticalDoctors}
          occupancyPercentage={metrics.percentage}
        />

        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          beds={beds}
          triagePatients={MOCK_TRIAGE_PATIENTS}
          ambulances={MOCK_AMBULANCES}
          doctors={doctors}
        />

        {activeTab === 'overview' && (
          <OverviewTab
            onTabChange={setActiveTab}
            triagePatients={MOCK_TRIAGE_PATIENTS}
            ambulances={MOCK_AMBULANCES}
            doctors={doctors}
            metrics={metrics}
            bySpecialty={bySpecialty}
            onFilterChange={setFilterSpecialty}
            onAssignDoctor={handleAssignDoctor}
            onViewPatientDetails={handleViewPatientDetails}
            onAmbulanceSelect={handleAmbulanceSelect}
            onDispatchAmbulance={handleDispatchAmbulance}
            onCallDoctor={handleCallDoctor}
            onViewDoctorSchedule={handleViewDoctorSchedule}
          />
        )}

        {activeTab === 'beds' && <BedsTab />}

        {activeTab === 'triage' && (
          <TriageTab
            patients={MOCK_TRIAGE_PATIENTS}
            onAssignDoctor={handleAssignDoctor}
            onViewPatientDetails={handleViewPatientDetails}
          />
        )}

        {activeTab === 'ambulances' && (
          <AmbulancesTab
            ambulances={MOCK_AMBULANCES}
            onSelectAmbulance={handleAmbulanceSelect}
            onDispatchAmbulance={handleDispatchAmbulance}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsTab
            doctors={doctors}
            onCallDoctor={handleCallDoctor}
            onViewDoctorSchedule={handleViewDoctorSchedule}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsTab />}
      </Container>
    </div>
  );
};
