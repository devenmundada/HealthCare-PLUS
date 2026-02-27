
import { medicalInsights, type MedicalInsight } from '../mocks/medicalInsights';
import { Container } from '../components/layout/Container';
import { GlassCard } from '../components/layout/GlassCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { MedicalDisclaimer } from '../components/shared/MedicalDisclaimer';
import { WeatherNotifications } from '../components/features/home/WeatherNotifications';
import AppointmentBookingModal from '../components/features/appointment/AppointmentBookingModal';
import { useAuth } from '../contexts/AuthContext';
import React, { useEffect, useState } from "react";
import VoiceAnalyzer from "../components/features/home/VoiceAnalyzer";


import {
  Users,
  Activity,
  Clock,
  Award,
  ChevronRight,
  Stethoscope,
  Shield,
  Brain,
  Zap,
  TrendingUp,
  Star,
  Calendar,
  Phone,
  Video,
  MapPin,
  AlertTriangle,
  Heart,
  MessageSquare,
  ThumbsUp,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Thermometer,
  Wind,
  Cloud,
  Bell,
  Mic,
  Play,
  Pause,
  Download,
  User,
  CheckCircle,
  AlertCircle,
  Plus,
  LogIn,
  LogOut,
  Share2
} from 'lucide-react';

export const Home: React.FC = () => {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<MedicalInsight | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  



  useEffect(() => {
    if (isCarouselPaused) return;

    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  const nextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
  };

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  const goToStory = (index: number) => {
    setCurrentStoryIndex(index);
  };


  const stats = [
    {
      label: 'Active Doctors',
      value: '500+',
      change: '+12%',
      icon: <Users className="w-6 h-6 text-primary-600" />,
      description: 'Verified medical professionals'
    },
    {
      label: 'Success Rate',
      value: '98.2%',
      change: '+0.8%',
      icon: <Award className="w-6 h-6 text-primary-600" />,
      description: 'Patient satisfaction'
    },
    {
      label: 'Avg. Response Time',
      value: '2.4s',
      change: '-15%',
      icon: <Clock className="w-6 h-6 text-primary-600" />,
      description: 'AI processing speed'
    },
    {
      label: 'Emergency Cases',
      value: '1.2K',
      change: '-8%',
      icon: <Activity className="w-6 h-6 text-primary-600" />,
      description: 'Handled this month'
    },
  ];

  const features = [
    {
      title: 'AI-Powered Diagnostics',
      description: 'Advanced medical imaging analysis with 96% clinical accuracy',
      icon: <Brain className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Voice Health Analysis',
      description: 'Analyze voice patterns for wellness insights and emotional state',
      icon: <Mic className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Real-time Appointment',
      description: 'Instant booking with automatic calendar sync and reminders',
      icon: <Calendar className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Emergency Response',
      description: '24/7 emergency support with location-based services',
      icon: <AlertTriangle className="w-8 h-8 text-primary-600" />
    },
  ];

  const successStories = [
    {
      id: 1,
      name: 'Robert Chen',
      city: 'San Francisco, CA',
      quote: 'Early detection through AI analysis saved my life. The continuous monitoring helped me regain control of my heart health.',
      condition: 'Cardiac Arrhythmia',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
      avatarInitials: 'RC',
      doctor: 'Dr. Sarah Chen',
      hospital: 'Mayo Clinic',
      rating: 5,
      age: 45
    },
    {
      id: 2,
      name: 'Maria Garcia',
      city: 'Austin, TX',
      quote: "The voice analysis detected subtle changes in my breathing. Early treatment made all the difference in managing my respiratory condition.",
      condition: 'Asthma Management',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=500&q=80',
      avatarInitials: 'MG',
      doctor: 'Dr. James Wilson',
      hospital: 'Johns Hopkins',
      rating: 5,
      age: 32
    },
    {
      id: 3,
      name: 'David Park',
      city: 'Chicago, IL',
      quote: 'Continuous glucose monitoring and AI insights transformed how I manage my diabetes. My A1C is the best it has been in years.',
      condition: 'Diabetes Management',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
      avatarInitials: 'DP',
      doctor: 'Dr. Emma Johnson',
      hospital: 'Cleveland Clinic',
      rating: 4,
      age: 58
    },
    {
      id: 4,
      name: 'Priya Sharma',
      city: 'New York, NY',
      quote: 'The mental health tracking helped me understand my anxiety patterns. Combined with therapy, I am living more peacefully.',
      condition: 'Mental Wellness',
      image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=500&q=80',
      avatarInitials: 'PS',
      doctor: 'Dr. Lisa Wang',
      hospital: 'Massachusetts General',
      rating: 5,
      age: 28
    },
    {
      id: 5,
      name: 'James Wilson',
      city: 'Miami, FL',
      quote: 'Post-surgery recovery was smooth with remote monitoring. My doctor knew exactly when I needed adjustments in medication.',
      condition: 'Post-Op Recovery',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=500&q=80',
      avatarInitials: 'JW',
      doctor: 'Dr. Michael Rodriguez',
      hospital: 'Stanford Health',
      rating: 5,
      age: 52
    }
  ];

  const dailyTips = [
    'Stay hydrated - Drink at least 8 glasses of water daily',
    'Get 7-8 hours of quality sleep each night',
    'Include 30 minutes of moderate exercise in your daily routine',
    'Practice mindfulness meditation for 10 minutes daily',
    'Schedule regular health check-ups, even when feeling well'
  ];

  // Add these components inside your Home component:

  // Auth Toggle Button Component
  const AuthToggleButton: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
      <Button
        variant="secondary"
        size="sm"
        leftIcon={isAuthenticated ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
        onClick={() => {
          if (isAuthenticated) {
            logout();
          } else {
            // In a real app, this would open a login modal
            window.location.href = '/signup';
          }
        }}
        className="border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300"
      >
        {isAuthenticated ? 'Logout' : 'Login'}
      </Button>
    );
  };

  // Conditional Content Component
  const AuthConditionalContent: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    // Provide default empty arrays to prevent undefined errors
    // These would normally come from the backend/API
    const appointments: Array<{
      id: string | number;
      type: string;
      status: string;
      doctor: string;
      specialization: string;
      date: string;
      time: string;
      duration: string;
    }> = [];
    const notifications: Array<{
      id: string | number;
      type: string;
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
      priority: string;
    }> = [];

    if (!isAuthenticated || !user) {
      return (
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              Sign in to View Your Health Dashboard
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
              Access personalized appointments, health notifications, and your complete medical history.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-800">
                <Calendar className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Appointments</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-800">
                <Bell className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Notifications</p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-neutral-800">
                <User className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Personalized Data</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                leftIcon={<LogIn className="w-5 h-5" />}
                onClick={() => {/* In real app, this would open login modal */ }}
              >
                Sign In to Continue
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {/* In real app, this would open signup */ }}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Personalized Greeting */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full border-4 border-white dark:border-neutral-800 shadow-lg"
              />
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Welcome back, {user.name.split(' ')[0]}!
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Here's your health overview for today
                </p>
              </div>
            </div>
            <Badge className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {user.location}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Upcoming Appointments
              </h3>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowAppointmentModal(true)}
              >
                New Appointment
              </Button>
            </div>

            <div className="space-y-4">
              {appointments.map((apt: any) => (
                <GlassCard key={apt.id} className="p-6 hover-lift">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={
                          apt.type === 'Video Consultation' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            apt.type === 'In-person' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        }>
                          {apt.type}
                        </Badge>
                        <Badge variant="outline" className={
                          apt.status === 'Scheduled' ? 'border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300' :
                            apt.status === 'Completed' ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-300' :
                              'border-red-200 text-red-700 dark:border-red-800 dark:text-red-300'
                        }>
                          {apt.status}
                        </Badge>
                      </div>

                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                        {apt.doctor}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                        {apt.specialization}
                      </p>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-neutral-500" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-500" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{apt.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-neutral-500" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{apt.duration}</span>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>

            {appointments.length === 0 && (
              <GlassCard className="p-8 text-center">
                <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  No Upcoming Appointments
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Schedule your next appointment to continue your health journey
                </p>
                <Button
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowAppointmentModal(true)}
                >
                  Book Appointment
                </Button>
              </GlassCard>
            )}
          </div>

          {/* Health Notifications */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                Health Notifications
              </h3>
              <Badge variant="outline">
                {notifications.filter((n: any) => !n.read).length} New
              </Badge>
            </div>

            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <GlassCard
                  key={notification.id}
                  className={`p-4 ${!notification.read ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${notification.type === 'Appointment' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      notification.type === 'Assessment' ? 'bg-green-100 dark:bg-green-900/30' :
                        notification.type === 'Voice Analysis' ? 'bg-purple-100 dark:bg-purple-900/30' :
                          'bg-amber-100 dark:bg-amber-900/30'
                      }`}>
                      {notification.type === 'Appointment' ? <Calendar className="w-4 h-4 text-blue-600" /> :
                        notification.type === 'Assessment' ? <Stethoscope className="w-4 h-4 text-green-600" /> :
                          notification.type === 'Voice Analysis' ? <User className="w-4 h-4 text-purple-600" /> :
                            <Bell className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500 dark:text-neutral-500">
                          {notification.timestamp}
                        </span>
                        <Badge size="sm" className={
                          notification.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-300'
                        }>
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Health Status Summary */}
            <GlassCard className="p-6 mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">Health Status</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Last updated today
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Appointments</span>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {appointments.filter((a: any) => a.status === 'Scheduled').length} Upcoming
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Assessments</span>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    2 Completed
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">Medication</span>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    On Track
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950/30 py-20 md:py-28">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/50 to-transparent dark:from-neutral-900/50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/30 to-transparent dark:from-neutral-900/30"></div>

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center fade-in-up">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-2 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm border-primary-200 dark:border-primary-800">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trusted by 500+ Hospitals
                </Badge>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-white leading-tight">
                  Your Health,
                  <span className="gradient-text block mt-2">Our Priority</span>
                </h1>

                <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                  AI-powered healthcare platform connecting you with trusted medical professionals.
                  From instant consultations to advanced diagnostics, we're here for your health journey.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  leftIcon={<Calendar className="w-5 h-5" />}
                  onClick={() => setShowAppointmentModal(true)}
                  className="btn-premium px-8 py-3 text-lg"
                >
                  Book an Appointment
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Video className="w-5 h-5" />}
                  className="px-8 py-3 text-lg border-2"
                >
                  Video Consultation
                </Button>
              </div>

              {/* Quick Stats - Enhanced */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                <div className="text-center p-5 bg-white/70 dark:bg-neutral-800/70 rounded-xl backdrop-blur-sm border border-white/30 dark:border-neutral-700/30">
                  <div className="text-2xl font-bold text-primary-600">24/7</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">AI Support</div>
                </div>
                <div className="text-center p-5 bg-white/70 dark:bg-neutral-800/70 rounded-xl backdrop-blur-sm border border-white/30 dark:border-neutral-700/30">
                  <div className="text-2xl font-bold text-primary-600">500+</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Doctors</div>
                </div>
                <div className="text-center p-5 bg-white/70 dark:bg-neutral-800/70 rounded-xl backdrop-blur-sm border border-white/30 dark:border-neutral-700/30">
                  <div className="text-2xl font-bold text-primary-600">98.2%</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Success Rate</div>
                </div>
                <div className="text-center p-5 bg-white/70 dark:bg-neutral-800/70 rounded-xl backdrop-blur-sm border border-white/30 dark:border-neutral-700/30">
                  <div className="text-2xl font-bold text-primary-600">2.4s</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Response Time</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Animated background blobs */}
              <div className="absolute -top-10 -right-10 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
              <div className="absolute top-20 -right-20 w-60 h-60 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

              <div className="glass-card p-8 border-0 shadow-xl relative">
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary-500 animate-pulse"></div>

                <div className="text-center space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 flex items-center justify-center border-4 border-white/50 dark:border-neutral-800/50 shadow-lg">
                    <Heart className="w-12 h-12 text-primary-600" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                      Start Your Health Journey
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Get personalized health insights in minutes
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      variant="secondary"
                      fullWidth
                      leftIcon={<Stethoscope className="w-5 h-5" />}
                      className="justify-start px-6 py-4 hover-lift"
                    >
                      <div className="text-left">
                        <div className="font-medium">Health Assessment</div>
                        <div className="text-xs text-neutral-500">10 min questionnaire</div>
                      </div>
                    </Button>

                    <Button
                      variant="secondary"
                      fullWidth
                      leftIcon={<MessageSquare className="w-5 h-5" />}
                      className="justify-start px-6 py-4 hover-lift"
                    >
                      <div className="text-left">
                        <div className="font-medium">Chat with AI Assistant</div>
                        <div className="text-xs text-neutral-500">24/7 available</div>
                      </div>
                    </Button>

                    <Button
                      variant="ghost"
                      fullWidth
                      leftIcon={<MapPin className="w-5 h-5" />}
                      className="justify-start px-6 py-4"
                    >
                      <div className="text-left">
                        <div className="font-medium">Find Nearby Hospitals</div>
                        <div className="text-xs text-neutral-500">Emergency services</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Voice Analyzer Section */}
      <section className="py-12">
        <Container>
          <VoiceAnalyzer />
        </Container>
      </section>

      {/* Stats Section */}
      {/* Stats Section - Enhanced */}
      <section className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4 clinical-heading">
              Trusted Healthcare Platform
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Real-time metrics demonstrating our commitment to your health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GlassCard
                  hoverable
                  className="p-6 border-0 hover-lift"
                >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${parseInt(stat.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-neutral-500 clinical-subtle">
                        {stat.description}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl">
                    {stat.icon}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${parseInt(stat.change) >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>
              </GlassCard>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Features */}
      {/* Features - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800/50">
        <Container>
          <div className="text-center mb-16">
            <Badge className="mb-4 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              <Zap className="w-4 h-4 mr-2" />
              Advanced Capabilities
            </Badge>

            <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6 clinical-heading">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
              Everything you need for complete healthcare management, powered by cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full p-8 hover-lift border-0 overflow-hidden">
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="p-4 inline-flex rounded-xl bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
                      {feature.title}
                    </h3>

                    <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                      Learn more
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Feature highlight bar */}
          <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-800">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">HIPAA Compliant</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Your data is always secure and private</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-800">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">24/7 Support</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Always here when you need us</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-800">
                  <Award className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">Verified Doctors</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">All practitioners are board-certified</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Success Stories */}
      {/* Success Stories - Enhanced Interactive Carousel */}
      <section
        className="py-16"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
      >
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
              Patient Success Stories
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Real experiences from our community. Hear how compassionate care made a difference.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Navigation Arrows */}
            <button
              onClick={prevStory}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-lg hover:bg-white dark:hover:bg-neutral-800 transition-all hover:scale-110 -translate-x-4"
              aria-label="Previous story"
            >
              <ChevronLeft className="w-6 h-6 text-primary-600" />
            </button>

            <button
              onClick={nextStory}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-lg hover:bg-white dark:hover:bg-neutral-800 transition-all hover:scale-110 translate-x-4"
              aria-label="Next story"
            >
              <ChevronRightIcon className="w-6 h-6 text-primary-600" />
            </button>

            {/* Carousel Content */}
            <GlassCard className="p-0 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Patient Image */}
                <div className="relative h-64 lg:h-auto min-h-[300px]">
                  <img
                    src={successStories[currentStoryIndex].image}
                    alt={successStories[currentStoryIndex].name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/40 lg:to-transparent" />

                  {/* Avatar Badge */}
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {successStories[currentStoryIndex].avatarInitials}
                  </div>

                  {/* City Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-primary-600" />
                      <span className="text-sm font-medium">{successStories[currentStoryIndex].city}</span>
                    </div>
                  </div>
                </div>

                {/* Story Details */}
                <div className="p-8 lg:p-10">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <svg className="w-8 h-8 text-primary-300" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8v8c0 2.21-1.79 4-4 4H4v-4h2c1.1 0 2-.9 2-2V8c0-2.21 1.79-4 4-4h2v4h-2c-1.1 0-2 .9-2 2zm14 0v8c0 2.21-1.79 4-4 4h-2v-4h2c1.1 0 2-.9 2-2V8c0-2.21 1.79-4 4-4h2v4h-2c-1.1 0-2 .9-2 2z" />
                    </svg>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl lg:text-2xl text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                    "{successStories[currentStoryIndex].quote}"
                  </blockquote>

                  {/* Patient Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-xl text-neutral-900 dark:text-white">
                        {successStories[currentStoryIndex].name}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Age {successStories[currentStoryIndex].age}
                      </p>
                    </div>

                    {/* Condition Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                      <Activity className="w-3 h-3" />
                      {successStories[currentStoryIndex].condition}
                    </div>

                    {/* Doctor and Hospital */}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">Treated by:</span> {successStories[currentStoryIndex].doctor}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
                        <Shield className="w-3 h-3" />
                        {successStories[currentStoryIndex].hospital}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < successStories[currentStoryIndex].rating ? 'text-yellow-500 fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {successStories[currentStoryIndex].rating}.0/5.0
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStory(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStoryIndex
                    ? 'w-8 bg-primary-600'
                    : 'bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600'
                    }`}
                  aria-label={`Go to story ${index + 1}`}
                />
              ))}
            </div>

            {/* Auto-slide indicator */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Clock className="w-3 h-3" />
                Auto-rotates every 5 seconds
                {isCarouselPaused && (
                  <span className="text-xs text-primary-600 ml-2">(Paused on hover)</span>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Weather & Notifications */}
      <section className="py-20 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20">
        <Container>
          <WeatherNotifications />
        </Container>
      </section>

      {/* Upcoming Appointments & Notifications - Conditionally shown based on auth */}
      <section className="py-16">
        <Container>
          {/* Auth Toggle Button for Demo */}
          <div className="flex justify-end mb-6">
            <AuthToggleButton />
          </div>

          {/* Conditionally render based on authentication */}
          <AuthConditionalContent />
        </Container>
      </section>

      {/* Blog & Daily Tips */}
      {/* Medical Insights & Blog - Enhanced */}
      <section className="py-20 bg-gradient-to-b from-white to-neutral-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-4">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium">Latest Research & Insights</span>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Medical Insights & Health Blog
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Evidence-based articles and expert advice for your health journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured Articles - Main Content */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {medicalInsights.slice(0, 4).map((article) => (
                  <article
                    key={article.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedArticle(article);
                      setShowArticleModal(true);
                    }}
                  >
                    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Article Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm">
                            {article.category}
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <Badge variant="outline" className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm">
                            {article.readTime}
                          </Badge>
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={article.authorAvatar}
                            alt={article.author}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                              {article.author}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {article.date}
                            </p>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Read More */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <span className="text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:underline">
                            Read full article
                          </span>
                          <ChevronRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </article>
                ))}
              </div>

              {/* View All Button */}
              <div className="mt-8 text-center">
                <Button
                  variant="secondary"
                  leftIcon={<TrendingUp className="w-4 h-4" />}
                  className="border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                >
                  View All Articles
                </Button>
              </div>
            </div>

            {/* Sidebar - Daily Tips & Categories */}
            <div className="space-y-6">
              {/* Categories */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-600" />
                  Browse by Category
                </h3>
                <div className="space-y-3">
                  {['Cardiology', 'Respiratory', 'Mental Health', 'Nutrition', 'Preventive Care', 'Pediatrics'].map((category) => (
                    <button
                      key={category}
                      className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300">{category}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Daily Health Tips - Keep your existing but enhanced */}
              <Card className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 mr-4">
                    <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white">
                      Today's Wellness Focus
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {dailyTips.map((tip, index) => (
                    <div key={index} className="flex items-start p-4 bg-gradient-to-r from-white to-green-50 dark:from-neutral-800 dark:to-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {index + 1}
                        </span>
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{tip}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  className="w-full mt-6"
                  leftIcon={<Bell className="w-4 h-4" />}
                >
                  Enable Daily Reminders
                </Button>
              </Card>

              {/* Newsletter Signup */}
              <Card className="p-6 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2">
                    Health Insights Newsletter
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Get weekly evidence-based health tips and research updates
                  </p>

                  <div className="space-y-3">
                    <Input
                      placeholder="Your email address"
                      className="bg-white dark:bg-neutral-800"
                    />
                    <Button className="w-full">
                      Subscribe
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Article Detail Modal */}
      {showArticleModal && selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
              onClick={() => setShowArticleModal(false)}
            />

            {/* Modal */}
            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-neutral-900 rounded-2xl shadow-xl">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <Badge className="mb-2">{selectedArticle.category}</Badge>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {selectedArticle.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowArticleModal(false)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Article Header */}
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={selectedArticle.authorAvatar}
                    alt={selectedArticle.author}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {selectedArticle.author}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>{selectedArticle.date}</span>
                      <span>•</span>
                      <span>{selectedArticle.readTime}</span>
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
                  <img
                    src={selectedArticle.imageUrl}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Article Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedArticle.fullContent.replace(/\n/g, '<br/>') }} />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                  {selectedArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Related Articles */}
                {selectedArticle.relatedArticles && selectedArticle.relatedArticles.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                      Related Insights
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medicalInsights
                        .filter(article => selectedArticle.relatedArticles?.includes(article.id))
                        .map(article => (
                          <div
                            key={article.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                            onClick={() => setSelectedArticle(article)}
                          >
                            <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                {article.title}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {article.category} • {article.readTime}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                      Save
                    </Button>
                  </div>
                  <Button onClick={() => setShowArticleModal(false)}>
                    Close Article
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <section className="py-12">
        <Container>
          <div className="max-w-4xl mx-auto">
            <MedicalDisclaimer variant="critical" />
          </div>
        </Container>
      </section>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />
    </div>
  );
};