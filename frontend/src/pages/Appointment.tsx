
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OnlineConsultationBooking } from '../components/features/appointment/OnlineConsultationBooking';
import { AppointmentList } from '../components/features/appointment/AppointmentList';
import { Container } from '../components/layout/Container';
import { useAuth } from '../contexts/AuthContext';
// End of Selection


export const Appointment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'book' | 'list'>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState([]);

  // Get doctor from navigation state if coming from doctor page
  useEffect(() => {
    if (location.state?.doctor) {
      setSelectedDoctor(location.state.doctor);
      setActiveTab('book');
    }
  }, [location.state]);

  // Fetch user's appointments
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments?user_id=${user?.id}&user_type=${user?.role}`);
      const data = await response.json();
      setAppointments(data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleBookingComplete = (appointment: any) => {
    setActiveTab('list');
    fetchAppointments();
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const tabs = [
    { id: 'list', label: 'My Appointments' },
    { id: 'book', label: 'Book New', disabled: !selectedDoctor }
  ];

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-6">Appointments</h1>
        
        {/* @ts-ignore */}
        <Tabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {activeTab === 'list' && (
            <AppointmentList 
              appointments={appointments}
              userType={user?.role as 'patient' | 'doctor' || 'patient'}
              onCancel={handleCancelAppointment}
            />
          )}

          {activeTab === 'book' && selectedDoctor && (
            <OnlineConsultationBooking 
              doctor={selectedDoctor}
              onBookingComplete={handleBookingComplete}
            />
          )}
        </div>
      </div>
    </Container>
  );
};
