import React, { useState } from 'react';
import { Container } from '../components/layout/Container';
import { GlassCard } from '../components/layout/GlassCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ImageAnalysisModal } from '../components/features/ImageAnalysisModal';
import { 
  Brain,
  MessageSquare,
  Mic,
  BarChart3,
  Code,
  Shield,
  Zap,
  Lock,
  Users,
  Globe,
  Cloud,
  Cpu,
  Database,
  Server,
  Terminal,
  FileText,
  Video,
  Calendar,
  Bell,
  Camera, // Add this import
  X, // Add this import
  CheckCircle, // Add this import
  Upload // Add this import
} from 'lucide-react';

export const Features: React.FC = () => {
  const [showImageAnalysis, setShowImageAnalysis] = useState(false); // Add this state

  const mainFeatures = [
    {
      id: 'image-analysis',
      title: 'AI Image Analysis',
      description: 'Advanced diagnostic support for medical imaging using TorchXRayVision models trained on 2M+ chest X-rays.',                                                                                         
      icon: <Brain className="w-8 h-8 text-primary-600" />,
      highlights: [
        '18+ pathology detection',
        'Grad-CAM visual explanations',
        'Real-time processing',
        'DICOM support'
      ],
      isComingSoon: false,
      onTryNow: () => setShowImageAnalysis(true) // Add this
    },
    {
      id: 'chat-assistant',
      title: 'Medical Chat Assistant',
      description: '24/7 AI-powered medical guidance with symptom checking and evidence-based recommendations.',                                                                                                        
      icon: <MessageSquare className="w-8 h-8 text-primary-600" />,
      highlights: [
        'Natural language processing',
        'HIPAA-compliant',
        'Emergency triage',
        'Multi-language support'
      ],
      isComingSoon: false,
      onTryNow: () => window.location.href = '/chat' // Optional: Link to chat
    },
    {
      id: 'voice-to-text',
      title: 'Voice-to-Text Medical Notes',
      description: 'Accurate speech recognition for clinical documentation with medical terminology support.',                                                                                                          
      icon: <Mic className="w-8 h-8 text-primary-600" />,
      highlights: [
        '99% accuracy rate',
        'Real-time transcription',
        'Medical terminology',
        'Integration with EHR'
      ],
      isComingSoon: true,
      onTryNow: null
    },
    {
      id: 'analytics',
      title: 'Clinical Analytics Dashboard',
      description: 'Comprehensive data visualization and insights for healthcare performance metrics.',
      icon: <BarChart3 className="w-8 h-8 text-primary-600" />,
      highlights: [
        'Real-time analytics',
        'Predictive modeling',
        'Custom reports',
        'Export capabilities'
      ],
      isComingSoon: false,
      onTryNow: null
    },
    {
      id: 'code-generator',
      title: 'AI Medical Code Generator',
      description: 'Automatic ICD-10 and CPT code suggestions based on clinical notes and diagnoses.',
      icon: <Code className="w-8 h-8 text-primary-600" />,
      highlights: [
        'ICD-10 automation',
        'CPT code suggestions',
        'Billing optimization',
        'Compliance checking'
      ],
      isComingSoon: true,
      onTryNow: null
    },
    {
      id: 'security',
      title: 'Enterprise Security Suite',
      description: 'End-to-end encryption, access controls, and compliance tools for healthcare organizations.',                                                                                                        
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      highlights: [
        'End-to-end encryption',
        'Role-based access control',
        'Audit trail',
        'HIPAA compliance'
      ],
      isComingNow: false,
      onTryNow: null
    },
    {
      id: 'telemedicine',
      title: 'Telemedicine Platform',
      description: 'Secure video consultations, appointment scheduling, and virtual care delivery.',
      icon: <Video className="w-8 h-8 text-primary-600" />,
      highlights: [
        'HD video calls',
        'Secure messaging',
        'Appointment scheduling',
        'Prescription management'
      ],
      isComingSoon: false,
      onTryNow: null
    },
    {
      id: 'appointment',
      title: 'Smart Appointment System',
      description: 'Intelligent scheduling with automated reminders and waitlist management.',
      icon: <Calendar className="w-8 h-8 text-primary-600" />,
      highlights: [
        'Smart scheduling',
        'Automated reminders',
        'Waitlist management',
        'No-show prediction'
      ],
      isComingSoon: false,
      onTryNow: null
    }
  ];

  const infrastructureFeatures = [
    {
      title: 'Cloud Infrastructure',
      description: 'Scalable and reliable cloud infrastructure with 99.9% uptime SLA.',
      icon: <Cloud className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'AI Processing',
      description: 'GPU-accelerated AI inference for real-time medical analysis.',
      icon: <Cpu className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Data Storage',
      description: 'Secure, encrypted storage with automatic backup and recovery.',
      icon: <Database className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'API Access',
      description: 'RESTful APIs for seamless integration with existing systems.',
      icon: <Server className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Add the modal */}
      <ImageAnalysisModal 
        isOpen={showImageAnalysis} 
        onClose={() => setShowImageAnalysis(false)} 
      />

      <Container>
        {/* Hero Section */}
        <div className="pt-12 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced Healthcare AI Platform
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Comprehensive suite of AI-powered tools designed for modern healthcare delivery, 
            combining cutting-edge technology with clinical expertise.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="primary">
              <Users className="w-5 h-5 mr-2" />
              Schedule a Demo
            </Button>
            <Button size="lg" variant="secondary">
              <FileText className="w-5 h-5 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>

        {/* Try Now Banner */}
        <div className="mb-12">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  🚀 Try AI Image Analysis Now
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Upload a medical image and see our AI in action. No login required.
                </p>
              </div>
              <Button 
                onClick={() => setShowImageAnalysis(true)}
                size="lg"
                variant="primary"
                leftIcon={<Camera className="w-5 h-5" />}
              >
                Try AI Analysis
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Main Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Core Features
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-2xl mx-auto">
            Each feature is designed to solve real healthcare challenges with AI-powered solutions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature) => (
              <Card 
                key={feature.id} 
                className="hover-lift transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/10 rounded-xl">
                      {feature.icon}
                    </div>
                    {feature.isComingSoon && (
                      <Badge variant="outline" className="ml-auto">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {feature.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  
                  {!feature.isComingSoon && feature.onTryNow && (
                    <Button 
                      onClick={feature.onTryNow}
                      variant="secondary"
                      className="w-full"
                      leftIcon={<Zap className="w-4 h-4" />}
                    >
                      Try Now
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Infrastructure Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Infrastructure & Security
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-2xl mx-auto">
            Built on enterprise-grade infrastructure with healthcare-specific security measures.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {infrastructureFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Join leading healthcare providers who are using our AI platform to improve patient outcomes and operational efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Terminal className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button size="lg" variant="ghost" className="text-white border-white">
              <Globe className="w-5 h-5 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};