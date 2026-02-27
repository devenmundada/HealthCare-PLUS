import React, { useEffect, useState } from 'react';
import { Container } from '../components/layout/Container';
import { MedicalCard } from '../components/ui/MedicalCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Toggle } from '../components/ui/Toggle';
import * as DoctorsAPI from '../services/doctors-api';
import AppointmentBookingModal from '../components/features/appointment/AppointmentBookingModal';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Phone,
  Video,
  Calendar,
  Award,
  Shield,
  Globe,
  Heart,
  Users,
  TrendingUp,
  ChevronDown,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

// Define Doctor and Review interfaces inline since types file might not exist
interface Doctor {
  id: string;
  name: string;
  hospitalId?: number | null;
  specialization: string;
  subSpecialty?: string;
  qualifications: string[];
  experience: number;
  rating: number;
  totalRatings: number;
  consultationFee: number;
  languages: string[];
  availability: {
    online: boolean;
    inPerson: boolean;
    emergency: boolean;
  };
  hospital: {
    name: string;
    city: string;
    distance?: string;
  };
  schedule: {
    days: string[];
    hours: string;
  };
  successRate: number;
  responseTime: string;
  verified: boolean;
  photoUrl: string;
  bio: string;
  patientReviews: Review[];
  // Database fields
  experience_years: number;
  consultation_fee: number;
  hospital_name?: string;
  hospital_city?: string;
  hospital_state?: string;
  available_days: string[];
  available_hours: string;
  is_verified: boolean;
}

interface Review {
  id: string;
  patientName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export const Doctors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [specialties, setSpecialties] = useState<string[]>([
    'All Specialties',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Oncology',
    'Psychiatry',
    'Gynecology',
    'Urology',
    'Endocrinology',
    'Gastroenterology'
  ]);

  // Fetch real doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real doctors from API - returns array directly
        const doctorsData = await DoctorsAPI.getDoctors({ limit: 20 });

        if (Array.isArray(doctorsData) && doctorsData.length >= 0) {
          // Transform API data to match your UI structure
          const transformedDoctors = doctorsData.map((doc: any): Doctor => ({
            id: doc.id.toString(),
            name: doc.name,
            hospitalId: doc.hospitalId ?? doc.hospital_id ?? null,
            specialization: doc.specialty,
            subSpecialty: doc.subSpecialty,
            qualifications: doc.qualification || [],
            experience: doc.experienceYears || doc.experience_years || 0,
            rating: doc.rating || 4.5,
            totalRatings: doc.reviewCount || doc.review_count || 0,
            consultationFee: doc.consultationFee || doc.consultation_fee || 0,
            languages: doc.languages || ['English', 'Hindi'],
            availability: {
              online: true,
              inPerson: true,
              emergency: doc.specialty === 'Emergency Medicine' || false
            },
            hospital: {
              name: doc.hospital_name || 'Apollo Hospital',
              city: doc.hospital_city || 'Mumbai',
              distance: Math.floor(Math.random() * 20 + 1) + ' km'
            },
            schedule: {
              days: doc.available_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              hours: doc.available_hours || '9:00 AM - 5:00 PM'
            },
            successRate: 95,
            responseTime: 'Under 2 hours',
            verified: doc.is_verified !== false,
            photoUrl: doc.profileImageUrl || doc.profile_image_url || `https://ui-avatars.com/api/?name=${doc.name}&background=00C2CB&color=fff&size=128`,
            bio: doc.bio || 'Experienced healthcare professional providing quality medical care.',
            patientReviews: [],
            // Database fields
            experience_years: doc.experienceYears || doc.experience_years || 0,
            consultation_fee: doc.consultationFee || doc.consultation_fee || 0,
            hospital_name: doc.hospital_name,
            hospital_city: doc.hospital_city,
            hospital_state: doc.hospital_state,
            available_days: doc.available_days || [],
            available_hours: doc.available_hours || '',
            is_verified: doc.is_verified !== false
          }));

          setDoctors(transformedDoctors);
          console.log('✅ Loaded doctors:', transformedDoctors.length);
        } else {
          setError('Failed to fetch doctors: Invalid data format');
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Unable to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const realSpecialties = await DoctorsAPI.getSpecialties();
        if (Array.isArray(realSpecialties) && realSpecialties.length > 0) {
          setSpecialties(['All Specialties', ...realSpecialties]);
          console.log('✅ Loaded specialties:', realSpecialties.length);
        }
      } catch (err) {
        console.error('Error fetching specialties:', err);
      }
    };

    fetchSpecialties();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchTerm === '' ||
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor.hospital.name && doctor.hospital.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty = selectedSpecialty === 'all' ||
      doctor.specialization === selectedSpecialty;

    const matchesOnline = !showOnlineOnly || doctor.availability.online;
    const matchesEmergency = !showEmergency || doctor.availability.emergency;

    return matchesSearch && matchesSpecialty && matchesOnline && matchesEmergency;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'experience') return b.experience - a.experience;
    return a.consultationFee - b.consultationFee;
  });

  const handleBookAppointment = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setShowBookingModal(true);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Find Trusted Healthcare Providers
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Connect with verified doctors, specialists, and healthcare professionals.
            All doctors are thoroughly vetted and rated by patients.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search doctors, specialties, hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty === 'All Specialties' ? 'all' : specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee">Lowest Fee</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Toggle
              enabled={showOnlineOnly}
              onChange={setShowOnlineOnly}
              label="Online Consultations Only"
            />
            <Toggle
              enabled={showEmergency}
              onChange={setShowEmergency}
              label="Emergency Available"
            />
            <div className="ml-auto flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {filteredDoctors.length} doctors found
              </span>
            </div>
          </div>
        </Card>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                Loading real doctors from database...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading doctors
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && filteredDoctors.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-neutral-800 rounded-xl shadow">
            <Search className="mx-auto text-neutral-400 dark:text-neutral-500 mb-4" size={48} />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No doctors found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && !error && filteredDoctors.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredDoctors.map((doctor) => (
                <MedicalCard
                  key={doctor.id}
                  className="hover-lift"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Doctor Photo & Basic Info */}
                    <div className="lg:w-1/3 p-6 border-r border-neutral-200 dark:border-neutral-700">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary-100 dark:border-primary-900/30 mb-4">
                          <img
                            src={doctor.photoUrl}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                          {doctor.name}
                        </h3>

                        <div className="mb-3">
                          <Badge variant="outline" className="mb-1">
                            {doctor.specialization}
                          </Badge>
                          {doctor.subSpecialty && (
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              {doctor.subSpecialty}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-center mb-4">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="ml-1 font-bold">{doctor.rating}</span>
                          <span className="ml-2 text-sm text-neutral-500">
                            ({doctor.totalRatings} reviews)
                          </span>
                        </div>

                        {doctor.verified && (
                          <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Verified Professional</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Information */}
                    <div className="lg:w-2/3 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                            Qualifications
                          </h4>
                          <ul className="space-y-1">
                            {doctor.qualifications.map((qual, idx) => (
                              <li key={idx} className="text-sm flex items-center">
                                <Award className="w-3 h-3 text-primary-600 mr-2" />
                                {qual}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                            Experience & Stats
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Experience</span>
                              <span className="font-medium">{doctor.experience} years</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Success Rate</span>
                              <span className="font-medium text-green-600">{doctor.successRate}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Response Time</span>
                              <span className="font-medium">{doctor.responseTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hospital & Availability */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                          Hospital & Availability
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-neutral-400 mr-2" />
                            <div>
                              <div className="font-medium">{doctor.hospital.name}</div>
                              <div className="text-sm text-neutral-500">
                                {doctor.hospital.city} • {doctor.hospital.distance} away
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-neutral-400 mr-2" />
                            <span className="text-sm">{doctor.schedule.hours}</span>
                          </div>
                        </div>
                      </div>

                      {/* Consultation Options */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                          Consultation Options
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {doctor.availability.online && (
                            <Badge variant="outline" className="flex items-center">
                              <Video className="w-3 h-3 mr-1" />
                              Video Consult
                            </Badge>
                          )}
                          {doctor.availability.inPerson && (
                            <Badge variant="outline" className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              In-Person
                            </Badge>
                          )}
                          {doctor.availability.emergency && (
                            <Badge variant="error" className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              Emergency
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Languages & Fee */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            Languages
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {doctor.languages.map((lang) => (
                              <span key={lang} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            Consultation Fee
                          </div>
                          <div className="text-2xl font-bold text-primary-600">
                            ₹{doctor.consultationFee}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleBookAppointment(doctor.id)}
                          className="flex-1"
                          leftIcon={<Calendar className="w-4 h-4" />}
                        >
                          Book Appointment
                        </Button>
                        <Button
                          variant="secondary"
                          leftIcon={<Phone className="w-4 h-4" />}
                        >
                          Call Clinic
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="border-t border-neutral-200 dark:border-neutral-700 p-6">
                    <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                      About Dr. {doctor.name.split(' ')[1] || doctor.name}
                    </h4>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {doctor.bio}
                    </p>
                  </div>

                  {/* Reviews Preview */}
                  {doctor.patientReviews.length > 0 && (
                    <div className="border-t border-neutral-200 dark:border-neutral-700 p-6">
                      <h4 className="font-medium text-neutral-900 dark:text-white mb-4">
                        Recent Patient Review
                      </h4>
                      {doctor.patientReviews.slice(0, 1).map((review) => (
                        <Card key={review.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                              <span className="font-medium">{review.rating}/5</span>
                              {review.verified && (
                                <Shield className="w-4 h-4 text-green-500 ml-2" />
                              )}
                            </div>
                            <span className="text-sm text-neutral-500">{review.date}</span>
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-400 italic">
                            "{review.comment}"
                          </p>
                          <div className="mt-2 text-sm text-neutral-500">
                            - {review.patientName}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </MedicalCard>
              ))}
            </div>

            {/* Statistics Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {doctors.length}+
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Verified Doctors
                </div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {doctors.length > 0
                    ? Math.round(doctors.reduce((sum, doc) => sum + doc.rating, 0) / doctors.length * 20)
                    : 98}%
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Patient Satisfaction
                </div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  24/7
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Emergency Support
                </div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {specialties.length - 1}+
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Specialties Covered
                </div>
              </Card>
            </div>
          </>
        )}

        {showBookingModal && (
          <AppointmentBookingModal
            isOpen={showBookingModal}
            selectedDoctor={selectedDoctor}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedDoctor(null);
            }}
          />
        )}
      </Container>
    </div>
  );
};

export default Doctors;