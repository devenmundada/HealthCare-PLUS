import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Container } from '../../components/layout/Container';
import { GlassCard } from '../../components/layout/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Video, Phone, MapPin, Users, Stethoscope, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useRealtime } from '../../contexts/RealtimeContext';

const API_URL = 'https://healthcare-backend-tylz.onrender.com/api';

interface Appointment {
  id: number;
  patientName: string;
  scheduledTime: string;
  appointmentType: string;
  status: string;
  meetingLink?: string;
  symptoms?: string[];
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { emergencies } = useRealtime();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/appointments/doctor/${user?.id}`);
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduledTime).toDateString();
    const today = new Date().toDateString();
    
    if (activeTab === 'today') return aptDate === today;
    if (activeTab === 'upcoming') return new Date(apt.scheduledTime) > new Date();
    return new Date(apt.scheduledTime) < new Date();
  });

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <Container>
        {/* Emergency Alerts */}
        {emergencies.length > 0 && (
          <div className="mb-6 space-y-2">
            {emergencies.map((emergency: any) => (
              <div key={emergency.alertId} className="p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-bold text-red-800">Emergency Alert</h3>
                    <p className="text-sm text-red-600">{emergency.message}</p>
                  </div>
                  <Button variant="danger" size="sm" className="ml-auto">
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-neutral-500">Welcome back, Dr. {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success">Online</Badge>
            <Button variant="secondary" size="sm">Mark Unavailable</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.filter(a => new Date(a.scheduledTime).toDateString() === new Date().toDateString()).length}</p>
                <p className="text-sm text-neutral-500">Today's Appointments</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Video className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.filter(a => a.appointmentType === 'online').length}</p>
                <p className="text-sm text-neutral-500">Online Consultations</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-sm text-neutral-500">Total Patients</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.5</p>
                <p className="text-sm text-neutral-500">Avg. Rating</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Appointments Section */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Appointments</h2>
            <div className="flex gap-2">
              <Button variant={activeTab === 'today' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('today')}>
                Today
              </Button>
              <Button variant={activeTab === 'upcoming' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('upcoming')}>
                Upcoming
              </Button>
              <Button variant={activeTab === 'past' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('past')}>
                Past
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-cyan"></div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              No appointments found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{apt.patientName}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(apt.scheduledTime).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1">
                          {apt.appointmentType === 'online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          {apt.appointmentType}
                        </div>
                      </div>
                      {apt.symptoms && apt.symptoms.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {apt.symptoms.map((s, i) => (
                            <Badge key={i} variant="outline" size="sm">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {apt.appointmentType === 'online' && apt.meetingLink && (
                        <Button size="sm" leftIcon={<Video className="w-4 h-4" />} onClick={() => handleStartMeeting(apt.meetingLink!)}>
                          Join Meeting
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" leftIcon={<Phone className="w-4 h-4" />}>
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </Container>
    </div>
  );
};

export default DoctorDashboard;
