import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const SOCKET_URL = 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Create socket connection
    const socketInstance = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      
      // Authenticate with user data
      socketInstance.emit('authenticate', {
        userId: user.id,
        userType: user.role,
        hospitalId: (user as any).hospitalId || 'hosp-001'
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('authenticated', (data) => {
      console.log('✅ Socket authenticated:', data);
    });

    socketInstance.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Subscribe to bed updates
  const onBedUpdate = useCallback((callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('bed:update', callback);
    return () => socket.off('bed:update', callback);
  }, [socket]);

  // Subscribe to patient transitions
  const onPatientTransition = useCallback((callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('patient:transition', callback);
    return () => socket.off('patient:transition', callback);
  }, [socket]);

  // Subscribe to ambulance locations
  const onAmbulanceLocation = useCallback((callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('ambulance:location', callback);
    return () => socket.off('ambulance:location', callback);
  }, [socket]);

  // Subscribe to doctor status updates
  const onDoctorStatus = useCallback((callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('doctor:status', callback);
    return () => socket.off('doctor:status', callback);
  }, [socket]);

  // Subscribe to emergency alerts
  const onEmergencyAlert = useCallback((callback: (data: any) => void) => {
    if (!socket) return;
    socket.on('alert:emergency', callback);
    return () => socket.off('alert:emergency', callback);
  }, [socket]);

  // Track ambulances for a hospital
  const trackAmbulances = useCallback((hospitalId: string) => {
    if (socket) {
      socket.emit('track-ambulances', hospitalId);
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    onBedUpdate,
    onPatientTransition,
    onAmbulanceLocation,
    onDoctorStatus,
    onEmergencyAlert,
    trackAmbulances
  };
};
