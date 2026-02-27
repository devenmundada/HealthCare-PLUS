import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import realtimeService from '../services/realtime.service';

interface RealtimeContextType {
  connected: boolean;
  beds: any[];
  patients: any[];
  doctors: any[];
  emergencies: any[];
  refreshData: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [beds, setBeds] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);

  const refreshData = async () => {
    try {
      const [bedsRes, patientsRes, doctorsRes] = await Promise.all([
        realtimeService.getBeds(),
        realtimeService.getPatients(),
        realtimeService.getDoctors({ available: true })
      ]);

      setBeds(bedsRes.data?.beds || []);
      setPatients(patientsRes.data?.patients || []);
      setDoctors(doctorsRes.data?.doctors || []);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    realtimeService.connect(user.id, user.role, user.hospitalId);

    realtimeService.on('bed:update', (data: any) => {
      setBeds(prev => prev.map(b => b.id === data.bedId ? { ...b, ...data } : b));
    });

    realtimeService.on('patient:transition', (data: any) => {
      setPatients(prev => prev.map(p => p.id === data.patientId ? { ...p, status: data.toStatus } : p));
      
      if (data.priority && data.priority <= 2) {
        setEmergencies(prev => [...prev, { ...data, timestamp: new Date() }]);
      }
    });

    realtimeService.on('doctor:status', (data: any) => {
      setDoctors(prev => prev.map(d => d.id === data.doctorId ? { ...d, ...data } : d));
    });

    realtimeService.on('alert:emergency', (data: any) => {
      setEmergencies(prev => [data, ...prev].slice(0, 10));
    });

    setConnected(true);
    refreshData();

    return () => {
      realtimeService.disconnect();
      setConnected(false);
    };
  }, [user]);

  return (
    <RealtimeContext.Provider value={{ connected, beds, patients, doctors, emergencies, refreshData }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider');
  return context;
};
