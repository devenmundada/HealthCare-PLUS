import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Container } from '../../components/layout/Container';
import { GlassCard } from '../../components/layout/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Video, Phone, Mail, MapPin, Users, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useRealtime } from '../../contexts/RealtimeContext';
import realtimeService from '../../services/realtime.service';

const API_URL = import.meta.env.VITE_API_URL || 'https://healthcare-backend-tylz.onrender.com/api';

interface Appointment {
  id: number;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  scheduledTime: string;
  appointmentType: string;
  status: string;
  meetingLink?: string;
  symptoms?: string[];
}

const STATUS_BADGE: Record<string, { variant: 'success' | 'warning' | 'error' | 'default'; label: string }> = {
  pending_confirmation: { variant: 'warning', label: 'Needs your response' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  scheduled: { variant: 'success', label: 'Confirmed' },
  cancelled: { variant: 'error', label: 'Cancelled' },
  completed: { variant: 'default', label: 'Completed' },
};

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { emergencies } = useRealtime();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [contactOpenId, setContactOpenId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);

  // The logged-in User's id and the Doctor profile's id are different rows —
  // resolve the real one before fetching anything appointment-related.
  useEffect(() => {
    if (!user?.id) return;
    axios
      .get(`${API_URL}/doctors/doctor-for-user/${user.id}`)
      .then((res) => setDoctorId(res.data?.data?.doctorId ?? null))
      .catch(() => setProfileError('No doctor profile is linked to this account yet.'));
  }, [user?.id]);

  const [isAcceptingPatients, setIsAcceptingPatients] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarBanner, setCalendarBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refetchDoctorProfile = useCallback(() => {
    if (!doctorId) return;
    axios
      .get(`${API_URL}/doctors/${doctorId}`)
      .then((res) => {
        const d = res.data?.data;
        if (d && typeof d.isAcceptingPatients === 'boolean') {
          setIsAcceptingPatients(d.isAcceptingPatients);
        }
        if (d) setCalendarConnected(!!d.googleCalendarConnected);
      })
      .catch(() => {});
  }, [doctorId]);

  useEffect(() => {
    refetchDoctorProfile();
  }, [refetchDoctorProfile]);

  // The OAuth callback (backend) redirects back here with ?calendar=... —
  // there was previously no button to even start this flow AND the
  // redirect target was wrong ('/doctor/dashboard' vs the real
  // '/doctor-dashboard' route), so a doctor could never actually connect
  // their calendar at all. Both are fixed; this surfaces the result.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('calendar');
    if (!result) return;

    if (result === 'connected') {
      setCalendarBanner({ type: 'success', message: 'Google Calendar connected — video appointments will now get a real Meet link when you confirm them.' });
      refetchDoctorProfile();
    } else if (result === 'no_refresh_token') {
      setCalendarBanner({ type: 'error', message: "Google didn't grant a reusable connection this time. Revoke Healthcare+'s access at myaccount.google.com/permissions and try connecting again." });
    } else if (result === 'error') {
      setCalendarBanner({ type: 'error', message: "Couldn't connect Google Calendar — please try again." });
    }

    // Clean the query param out of the URL without a full reload.
    window.history.replaceState({}, '', window.location.pathname);
  }, [refetchDoctorProfile]);

  const connectGoogleCalendar = () => {
    if (!doctorId) return;
    window.location.href = `${API_URL}/auth/google/connect/${doctorId}`;
  };

  const toggleAvailability = async () => {
    if (!doctorId) return;
    setTogglingAvailability(true);
    const next = !isAcceptingPatients;
    try {
      await axios.patch(`${API_URL}/doctors/${doctorId}/availability`, { isAcceptingPatients: next });
      setIsAcceptingPatients(next);
    } catch (error) {
      console.error('Failed to update availability:', error);
      alert("Couldn't update your availability — please try again.");
    } finally {
      setTogglingAvailability(false);
    }
  };

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) return;
    try {
      const response = await axios.get(`${API_URL}/appointments/doctor/${doctorId}`);
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (doctorId) fetchAppointments();
    else if (profileError) setLoading(false);
  }, [fetchAppointments, doctorId, profileError]);

  // Live-refresh when a new booking request comes in or another session
  // (e.g. this doctor logged in on another tab) changes an appointment's
  // status, instead of requiring a manual page reload.
  useEffect(() => {
    const onTransition = () => fetchAppointments();
    const onNotification = () => fetchAppointments();
    realtimeService.on('patient:transition', onTransition);
    realtimeService.on('notification:new', onNotification);
    return () => {
      realtimeService.off('patient:transition', onTransition);
      realtimeService.off('notification:new', onNotification);
    };
  }, [fetchAppointments]);

  const handleStartMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const respondToAppointment = async (id: number, status: 'confirmed' | 'cancelled') => {
    setRespondingId(id);
    try {
      const reason = status === 'cancelled' ? window.prompt('Reason for declining (optional):') || undefined : undefined;
      await axios.patch(`${API_URL}/appointments/${id}/status`, { status, reason });
      await fetchAppointments();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert("Couldn't update this appointment — please try again.");
    } finally {
      setRespondingId(null);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduledTime).toDateString();
    const today = new Date().toDateString();

    if (activeTab === 'today') return aptDate === today;
    if (activeTab === 'upcoming') return new Date(apt.scheduledTime) > new Date();
    return new Date(apt.scheduledTime) < new Date();
  });

  const pendingCount = appointments.filter((a) => a.status === 'pending_confirmation').length;

  const visibleEmergencies = emergencies.filter((e: any) => !acknowledgedAlertIds.includes(e.alertId));

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <Container>
        {/* Emergency Alerts */}
        {visibleEmergencies.length > 0 && (
          <div className="mb-6 space-y-2">
            {visibleEmergencies.map((emergency: any) => (
              <div key={emergency.alertId} className="p-4 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="font-bold text-red-800">Emergency Alert</h3>
                    <p className="text-sm text-red-600">{emergency.message}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setAcknowledgedAlertIds((prev) => [...prev, emergency.alertId])}
                  >
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
            <Badge variant={calendarConnected ? 'success' : 'default'}>
              {calendarConnected ? 'Google Calendar Connected' : 'Calendar Not Connected'}
            </Badge>
            {!calendarConnected && (
              <Button variant="secondary" size="sm" disabled={!doctorId} onClick={connectGoogleCalendar} leftIcon={<Calendar className="w-4 h-4" />}>
                Connect Google Calendar
              </Button>
            )}
            <Badge variant={isAcceptingPatients ? 'success' : 'default'}>
              {isAcceptingPatients ? 'Accepting Patients' : 'Unavailable'}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              disabled={togglingAvailability || !doctorId}
              onClick={toggleAvailability}
              leftIcon={togglingAvailability ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isAcceptingPatients ? 'Mark Unavailable' : 'Mark Available'}
            </Button>
          </div>
        </div>

        {calendarBanner && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            calendarBanner.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {calendarBanner.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${calendarBanner.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {calendarBanner.message}
            </p>
          </div>
        )}

        {profileError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{profileError}</p>
          </div>
        )}

        {/* Pending Requests Banner */}
        {pendingCount > 0 && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              You have <strong>{pendingCount}</strong> appointment request{pendingCount > 1 ? 's' : ''} waiting for your response.
            </p>
          </div>
        )}

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
              {filteredAppointments.map((apt) => {
                const statusInfo = STATUS_BADGE[apt.status] || { variant: 'default' as const, label: apt.status };
                const isPending = apt.status === 'pending_confirmation';
                const isResponding = respondingId === apt.id;

                return (
                  <div
                    key={apt.id}
                    className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                      isPending ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{apt.patientName}</h3>
                          <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(apt.scheduledTime).toLocaleString()}
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

                        {contactOpenId === apt.id && (
                          <div className="mt-3 flex flex-col gap-1 text-sm">
                            {apt.patientPhone && (
                              <a href={`tel:${apt.patientPhone}`} className="text-primary-600 hover:underline flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {apt.patientPhone}
                              </a>
                            )}
                            {apt.patientEmail && (
                              <a href={`mailto:${apt.patientEmail}`} className="text-primary-600 hover:underline flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" /> {apt.patientEmail}
                              </a>
                            )}
                            {!apt.patientPhone && !apt.patientEmail && (
                              <span className="text-neutral-400">No contact details on file</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {isPending && (
                          <>
                            <Button
                              size="sm"
                              variant="clinical"
                              leftIcon={isResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              disabled={isResponding}
                              onClick={() => respondToAppointment(apt.id, 'confirmed')}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              leftIcon={<X className="w-4 h-4" />}
                              disabled={isResponding}
                              onClick={() => respondToAppointment(apt.id, 'cancelled')}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {apt.appointmentType === 'online' && apt.meetingLink && (
                          <Button size="sm" leftIcon={<Video className="w-4 h-4" />} onClick={() => handleStartMeeting(apt.meetingLink!)}>
                            Join Meeting
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Phone className="w-4 h-4" />}
                          onClick={() => setContactOpenId(contactOpenId === apt.id ? null : apt.id)}
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </Container>
    </div>
  );
};

export default DoctorDashboard;
