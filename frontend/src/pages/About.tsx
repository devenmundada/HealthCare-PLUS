import React from 'react';
import { Container } from '../components/layout/Container';
import { GlassCard } from '../components/layout/GlassCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Heart,
  Target,
  Eye,
  Users,
  Award,
  Globe,
  TrendingUp,
  Shield,
  Zap,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';

export const About: React.FC = () => {
  const values = [
    {
      title: 'Patient-Centered',
      description: 'Every feature is designed with patient outcomes as the primary focus.',
      icon: <Heart className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Clinical Excellence',
      description: 'Maintaining the highest standards of medical accuracy and reliability.',
      icon: <Target className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Transparency',
      description: 'Clear explanations of AI decision-making processes for clinicians.',
      icon: <Eye className="w-8 h-8 text-primary-600" />
    },
    {
      title: 'Collaboration',
      description: 'Fostering partnerships between AI and healthcare professionals.',
      icon: <Users className="w-8 h-8 text-primary-600" />
    }
  ];

  const milestones = [
    { year: '2021', event: 'Company Founded', description: 'Started with a vision to transform healthcare with AI' },
    { year: '2022', event: 'First Clinical Trial', description: 'Partnered with 3 major hospitals for validation' },
    { year: '2023', event: 'Series A Funding', description: 'Raised $20M to expand research and development' },
    { year: '2024', event: 'Platform Launch', description: 'Public launch of HealthCare+ with 5 core features' },
    { year: '2025', event: 'Global Expansion', description: 'Expanding to 10+ countries worldwide' }
  ];

  const team = [
    { name: 'Dr. Sarah Chen', role: 'Chief Medical Officer', expertise: 'Cardiology, AI Ethics' },
    { name: 'Michael Rodriguez', role: 'Head of AI Research', expertise: 'Machine Learning, Medical Imaging' },
    { name: 'Dr. James Wilson', role: 'Clinical Director', expertise: 'Oncology, Clinical Trials' },
    { name: 'Emma Johnson', role: 'Head of Product', expertise: 'Healthcare Technology, UX Design' },
    { name: 'David Kim', role: 'Chief Technology Officer', expertise: 'Cloud Infrastructure, Security' },
    { name: 'Lisa Wang', role: 'Head of Data Science', expertise: 'Predictive Analytics, NLP' }
  ];

  return (
    <div className="min-h-screen py-12">
      <Container>
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
            Redefining Healthcare with AI
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
            We're building the future of medical technology—where artificial intelligence 
            enhances human expertise to deliver better patient outcomes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary">
              <Globe className="w-4 h-4 mr-2" />
              Global Impact Report
            </Button>
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Join Our Mission
            </Button>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <GlassCard className="p-8">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              To empower healthcare professionals with AI tools that enhance diagnostic 
              accuracy, improve patient outcomes, and make quality healthcare accessible globally.
            </p>
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p className="text-primary-700 dark:text-primary-300 font-medium">
                "Technology should serve humanity, especially in healthcare."
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              Our Vision
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              A world where every medical decision is informed by the best available 
              technology and every patient receives the highest standard of care, 
              regardless of location or resources.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Hospitals</div>
              </div>
              <div className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-600">50+</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Countries</div>
              </div>
              <div className="flex-1 p-3 bg-white dark:bg-neutral-800 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary-600">2M+</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Patients</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
            Our Journey
          </h2>
          <GlassCard className="p-8">
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary-200 dark:bg-primary-800" />
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                    <div className="inline-block p-4 bg-white dark:bg-neutral-800 rounded-xl shadow-lg">
                      <div className="text-sm font-semibold text-primary-600 mb-1">
                        {milestone.year}
                      </div>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                        {milestone.event}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 rounded-full bg-primary-600 border-4 border-white dark:border-neutral-800" />
                  </div>
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
            Leadership Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="p-6 hover-lift">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {member.role}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Expertise: {member.expertise}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <GlassCard className="p-8 mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8 text-center">
            Awards & Recognition
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">
                Best HealthTech 2023
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Digital Health Awards
              </p>
            </div>
            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">
                HIPAA Excellence
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Security & Compliance
              </p>
            </div>
            <div className="text-center p-6">
              <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">
                AI Innovation
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                TechCrunch Disrupt
              </p>
            </div>
            <div className="text-center p-6">
              <Star className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h4 className="font-bold text-neutral-900 dark:text-white mb-2">
                Top Startup
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Forbes 30 Under 30
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            Join Us in Transforming Healthcare
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            Whether you're a healthcare provider, researcher, or technologist, 
            there's a place for you in our mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" leftIcon={<Users className="w-5 h-5" />}>
              Career Opportunities
            </Button>
            <Button variant="secondary" size="lg" leftIcon={<Clock className="w-5 h-5" />}>
              Schedule a Meeting
            </Button>
            <Button variant="ghost" size="lg" leftIcon={<CheckCircle className="w-5 h-5" />}>
              Partner With Us
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};