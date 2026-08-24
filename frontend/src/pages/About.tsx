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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary-50/30 dark:from-[#0B1221] dark:via-[#0F172A] dark:to-[#1E293B] py-16">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-primary-100/40 to-transparent dark:from-primary-900/20 pointer-events-none z-0"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/20 dark:bg-primary-500/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-blob z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] pointer-events-none z-0"></div>

      <Container className="relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20 fade-in-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
            Redefining Healthcare
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent block mt-2 pb-2">with AI</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-8">
            We're building the future of medical technology—where artificial intelligence 
            enhances human expertise to deliver better patient outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-white shadow-[0_8px_30px_rgb(0,194,203,0.3)] dark:shadow-[0_8px_30px_rgb(0,194,203,0.2)] rounded-xl px-8 py-4 text-lg font-medium transition-all hover:-translate-y-1">
              <Globe className="w-5 h-5 mr-2" />
              Global Impact Report
            </Button>
            <Button variant="secondary" size="lg" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 shadow-sm rounded-xl px-8 py-4 text-lg font-medium transition-all hover:-translate-y-1 text-slate-700 dark:text-slate-200">
              <Users className="w-5 h-5 mr-2" />
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
              <div key={index} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-8 text-center group hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 flex items-center justify-center transform group-hover:rotate-3 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 font-light">
                  {value.description}
                </p>
              </div>
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
              <div key={index} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-6 group hover:-translate-y-1">
                <div className="flex items-start mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400 font-medium">
                      {member.role}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Expertise:</span> {member.expertise}
                </p>
              </div>
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