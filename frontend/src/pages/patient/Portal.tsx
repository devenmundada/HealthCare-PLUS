import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtime } from '../../contexts/RealtimeContext';
import { Container } from '../../components/layout/Container';
import { GlassCard } from '../../components/layout/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Calendar, Clock, Video, Phone, MapPin, FileText, Download, Bell,
  User, Settings, LogOut, Star, Navigation, Filter, X, AlertTriangle,
  MessageSquare, Search, Heart, Shield, Award
} from 'lucide-react';
import axios from 'axios';
import AppointmentBookingModal from '../../components/features/appointment/AppointmentBookingModal';
import { RealTimeNotification } from '../../components/features/notifications/RealTimeNotification';

const API_URL = 'https://healthcare-backend-tylz.onrender.com/api';

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialty: string;
  scheduledTime: string;
  appointmentType: string;
  status: string;
  meetingLink?: string;
  hospitalName: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  consultationFee: number;
  rating: number;
  experienceYears: number;
  languages: string[];
  hospitalName?: string;
  hospitalAddress?: string;
  distance?: number;
  availableToday?: boolean;
  nextSlot?: string;
}

// Location service functions
const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return Math.round(R * c * 10) / 10;
};

// Resolved: Property 'appointments' does not exist on type 'RealtimeContextType'.
// Instead, get appointments only from backend, not realtime state.
export const PatientPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const realtime = useRealtime();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [portalTab, setPortalTab] = useState<'dashboard' | 'find-doctors' | 'appointments' | 'records'>('dashboard');
  
  // Location and filters
  const [userLocation, setUserLocation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [maxFee, setMaxFee] = useState(2000);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    fetchData();
    initializeLocation();
    fetchSpecialties();
  }, []);

  // Removed useEffect for realtime?.appointments; source of error.
  // useEffect(() => {
  //   if (realtime?.appointments) {
  //     setAppointments(realtime.appointments);
  //   }
  // }, [realtime?.appointments]);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialty, maxDistance, maxFee, userLocation]);

  const initializeLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.log('Using default location (Mumbai)');
      setUserLocation({ lat: 19.0760, lng: 72.8777 });
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes] = await Promise.all([
        axios.get(`${API_URL}/appointments/patient/${user?.id}`),
        axios.get(`${API_URL}/doctors`)
      ]);

      if (appointmentsRes.data.success) {
        setAppointments(appointmentsRes.data.data);
      }
      if (doctorsRes.data.success) {
        const doctorsWithDistance = doctorsRes.data.data?.doctors?.map((doc: any) => ({
          ...doc,
          distance: userLocation ? calculateDistance(
            userLocation.lat, userLocation.lng,
            19.0760, 72.8777
          ) : undefined,
          availableToday: Math.random() > 0.3,
          nextSlot: `${Math.floor(Math.random() * 3 + 1)}:00 PM`,
          hospitalName: doc.hospital_name || 'City Hospital',
          hospitalAddress: doc.hospital_address || 'Mumbai'
        })) || [];
        setDoctors(doctorsWithDistance);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors/specialties`);
      if (response.data.success) {
        setSpecialties(['all', ...(response.data.data || [])]);
      }
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doc => doc.specialty === selectedSpecialty);
    }

    if (userLocation) {
      filtered = filtered.filter(doc => 
        !doc.distance || doc.distance <= maxDistance
      );
    }

    filtered = filtered.filter(doc => (doc.consultationFee || 0) <= maxFee);

    filtered.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    setFilteredDoctors(filtered);
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const handleModalClose = () => {
    setShowBookingModal(false);
    setSelectedDoctor(null);
  };

  const handleModalBooked = () => {
    fetchData();
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setPortalTab('appointments');
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.scheduledTime);
    const now = new Date();
    if (activeTab === 'upcoming') return aptDate > now;
    return aptDate < now;
  });

  const upcomingCount = appointments.filter(apt => new Date(apt.scheduledTime) > new Date()).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-medical-cyan">Healthcare+</h1>
              <nav className="hidden md:flex gap-2">
                <button
                  onClick={() => setPortalTab('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    portalTab === 'dashboard' 
                      ? 'bg-medical-cyan text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setPortalTab('find-doctors')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    portalTab === 'find-doctors' 
                      ? 'bg-medical-cyan text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  Find Doctors
                </button>
                <button
                  onClick={() => setPortalTab('appointments')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    portalTab === 'appointments' 
                      ? 'bg-medical-cyan text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  My Appointments
                  {upcomingCount > 0 && (
                    <Badge variant="danger" size="sm" className="ml-2">
                      {upcomingCount}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setPortalTab('records')}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    portalTab === 'records' 
                      ? 'bg-medical-cyan text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  Health Records
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <RealTimeNotification />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-medical-cyan/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-medical-cyan" />
                </div>
                <span className="text-sm font-medium hidden md:block">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        {/* Welcome Banner */}
        <div className="p-6 mb-8 bg-gradient-to-r from-medical-cyan to-blue-500 text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h2>
              <p className="opacity-90">
                {upcomingCount > 0 
                  ? `You have ${upcomingCount} upcoming appointment${upcomingCount > 1 ? 's' : ''}`
                  : 'Ready to book your next health checkup?'}
              </p>
            </div>
          {upcomingCount > 0 && (
              <Button 
                variant="secondary" 
                onClick={() => setPortalTab('appointments')}
                className="bg-white text-medical-cyan hover:bg-gray-100"
              >
                View Appointments
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Tab */}
        {portalTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{upcomingCount}</p>
                    <p className="text-sm text-gray-500">Upcoming</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{doctors.length}+</p>
                    <p className="text-sm text-gray-500">Doctors</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-gray-500">Rating</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-sm text-gray-500">Secure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-white rounded-xl border"
                onClick={() => setPortalTab('find-doctors')}
              >
                <Calendar className="w-12 h-12 mx-auto mb-3 text-medical-cyan" />
                <h3 className="font-bold text-lg">Book Appointment</h3>
                <p className="text-sm text-gray-500">Find and book with nearby doctors</p>
              </button>

              <button 
                className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-white rounded-xl border"
                onClick={() => setPortalTab('appointments')}
              >
                <Clock className="w-12 h-12 mx-auto mb-3 text-medical-cyan" />
                <h3 className="font-bold text-lg">My Appointments</h3>
                <p className="text-sm text-gray-500">View and manage your visits</p>
              </button>

              <button 
                className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-white rounded-xl border"
                onClick={() => setPortalTab('records')}
              >
                <FileText className="w-12 h-12 mx-auto mb-3 text-medical-cyan" />
                <h3 className="font-bold text-lg">Health Records</h3>
                <p className="text-sm text-gray-500">Access your medical history</p>
              </button>
            </div>

            {/* Recommended Doctors Preview */}
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recommended for You</h2>
                <Button variant="ghost" size="sm" onClick={() => setPortalTab('find-doctors')}>
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {doctors.slice(0, 3).map((doctor) => (
                  <div key={doctor.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-bold">{doctor.name}</h3>
                    <p className="text-medical-cyan text-sm">{doctor.specialty}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{doctor.rating}</span>
                      <span>•</span>
                      <span>₹{doctor.consultationFee}</span>
                    </div>
                    {doctor.distance && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <Navigation className="w-3 h-3" />
                        {doctor.distance} km away
                      </div>
                    )}
                    <Button size="sm" fullWidth className="mt-3" onClick={() => handleBookAppointment(doctor)}>
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Find Doctors Tab */}
        {portalTab === 'find-doctors' && (
          <div className="space-y-6">
            {/* Search Header */}
            <div className="flex-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search doctors, specialties, hospitals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                />
                {userLocation && !locationLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    Using your location
                  </div>
                )}
              </div>
              <Button
                variant={showFilters ? 'primary' : 'secondary'}
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter className="w-4 h-4" />}
              >
                Filters
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="p-6 bg-white rounded-xl shadow-sm animate-slideDown">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Filter Doctors</h3>
                  <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Specialty</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-medical-cyan"
                    >
                      {specialties.map(s => (
                        <option key={s} value={s}>
                          {s === 'all' ? 'All Specialties' : s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Distance: {maxDistance} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Fee: ₹{maxFee}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={maxFee}
                      onChange={(e) => setMaxFee(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-500">
              Found {filteredDoctors.length} doctors near you
            </div>

            {/* Doctor Cards */}
            {locationLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-cyan"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left Column - Basic Info */}
                      <div className="md:w-1/3">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-medical-cyan/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-medical-cyan">
                              {doctor.name?.charAt(0) || 'D'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{doctor.name}</h3>
                            <p className="text-medical-cyan">{doctor.specialty}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{doctor.rating || 4.5}</span>
                              <span className="text-xs text-gray-500">
                                {doctor.experienceYears || 10}+ years
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle Column - Location & Availability */}
                      <div className="md:w-1/3">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                            <div>
                              <p className="font-medium">{doctor.hospitalName || 'City Hospital'}</p>
                              <p className="text-sm text-gray-500">{doctor.hospitalAddress || 'Mumbai'}</p>
                              {doctor.distance && (
                                <span className="inline-flex items-center px-2 py-1 mt-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                  <Navigation className="w-3 h-3 mr-1" />
                                  {doctor.distance} km away
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Booking */}
                      <div className="md:w-1/3 flex flex-col items-end justify-between">
                        <div className="text-right mb-4">
                          <p className="text-2xl font-bold text-medical-cyan">
                            ₹{doctor.consultationFee || 500}
                          </p>
                          <p className="text-sm text-gray-500">Consultation fee</p>
                          {doctor.availableToday && (
                            <span className="inline-flex items-center px-2 py-1 mt-2 text-xs bg-green-100 text-green-700 rounded-full">
                              <Clock className="w-3 h-3 mr-1" />
                              Available Today at {doctor.nextSlot}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => handleBookAppointment(doctor)}
                          className="w-full md:w-auto"
                        >
                          Book Appointment
                        </Button>
                      </div>
                    </div>

                    {/* Languages & Additional Info */}
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                      {doctor.languages?.map((lang, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredDoctors.length === 0 && (
                  <div className="p-12 text-center bg-white rounded-xl shadow-sm">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No doctors found</h3>
                    <p className="text-gray-500">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {portalTab === 'appointments' && (
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Your Appointments</h2>
              <div className="flex gap-2">
                <Button 
                  variant={activeTab === 'upcoming' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming
                </Button>
                <Button 
                  variant={activeTab === 'past' ? 'primary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveTab('past')}
                >
                  Past
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-cyan"></div>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No {activeTab} appointments</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'upcoming' 
                    ? 'Ready to book your next appointment?' 
                    : 'Your past appointments will appear here'}
                </p>
                {activeTab === 'upcoming' && (
                  <Button onClick={() => setPortalTab('find-doctors')}>
                    Find Doctors
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">Dr. {apt.doctorName}</h3>
                        <p className="text-medical-cyan text-sm">{apt.doctorSpecialty}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(apt.scheduledTime).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            {apt.appointmentType === 'online' ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                            {apt.appointmentType}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">{apt.hospitalName}</p>
                      </div>
                      <div className="flex gap-2">
                        {apt.status === 'scheduled' && apt.appointmentType === 'online' && apt.meetingLink && (
                          <Button 
                            size="sm" 
                            leftIcon={<Video className="w-4 h-4" />} 
                            onClick={() => window.open(apt.meetingLink, '_blank')}
                          >
                            Join
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                          Prescription
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Health Records Tab */}
        {portalTab === 'records' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-white rounded-xl border">
              <FileText className="w-12 h-12 mx-auto mb-3 text-medical-cyan" />
              <h3 className="font-bold text-lg">Medical History</h3>
              <p className="text-sm text-gray-500">View your past records and diagnoses</p>
            </button>
            
            <button className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-white rounded-xl border">
              <svg className="w-12 h-12 mx-auto mb-3 text-medical-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="font-bold text-lg">Prescriptions</h3>
              <p className="text-sm text-gray-500">Download and view your prescriptions</p>
            </button>
            
            <button className="p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 bg-white rounded-xl border">
              <svg className="w-12 h-12 mx-auto mb-3 text-medical-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="font-bold text-lg">Lab Reports</h3>
              <p className="text-sm text-gray-500">View your test results and reports</p>
            </button>
          </div>
        )}

        {/* Booking Modal - Pass only valid props */}
        {showBookingModal && selectedDoctor && (
          <AppointmentBookingModal
            isOpen={showBookingModal}
            onClose={handleModalClose}
            selectedDoctor={selectedDoctor}
          />
        )}
      </Container>
    </div>
  );
};

export default PatientPortal;
