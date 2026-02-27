import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Container } from '../components/layout/Container';
import { GlassCard } from '../components/layout/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Heart
} from 'lucide-react';

interface SignUpForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (basic)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send data to backend API using the API service
      const response = await api.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      const data = response.data;

      if (response.status === 201 || response.status === 200) {
        // Success
        setSignUpSuccess(true);
        
        // Store token in localStorage if provided
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      // Handle backend errors
      let errorMessage = 'Unable to connect to the server. Please check if the backend server is running.';
      
      if (error instanceof AxiosError) {
        // Check for connection refused errors
        if (error.code === 'ECONNREFUSED' || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to the server. Please ensure the backend server is running on port 3001.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Cannot connect to the server. Please ensure the backend server is running on port 3001.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({
        email: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: 'Empty', color: 'bg-neutral-200' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengths = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' },
    ];
    
    return strengths[strength] || strengths[0];
  };

  if (signUpSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950/30">
        <Container className="py-20">
          <div className="max-w-md mx-auto text-center">
            <GlassCard className="p-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                Account Created Successfully!
              </h1>
              
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Welcome to Healthcare AI Platform, {formData.name}! 
                Your account has been created and you'll be redirected shortly.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <div className="text-sm text-primary-700 dark:text-primary-300">
                    Check your email at <strong>{formData.email}</strong> for verification.
                  </div>
                </div>
                
                <div className="text-sm text-neutral-500">
                  <div className="flex items-center justify-center space-x-2 animate-pulse">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <div>Redirecting to home page...</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </Container>
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-blue-950/30">
      <Container className="py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-4">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Join Our Healthcare Community</span>
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Create Your Account
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Join thousands of users managing their health with AI-powered tools
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div>
              <GlassCard className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      leftIcon={<User className="w-4 h-4" />}
                      error={errors.name}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      leftIcon={<Mail className="w-4 h-4" />}
                      error={errors.email}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(123) 456-7890"
                      leftIcon={<Phone className="w-4 h-4" />}
                      error={errors.phone}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Password
                    </label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      error={errors.password}
                      disabled={isLoading}
                    />
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">
                            Password strength: {passwordStrength.label}
                          </span>
                          <span className="font-medium">{formData.password.length}/20</span>
                        </div>
                        <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                            style={{ width: `${(formData.password.length / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      leftIcon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      error={errors.confirmPassword}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Terms Agreement */}
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label htmlFor="agreeToTerms" className="text-sm text-neutral-700 dark:text-neutral-300">
                        I agree to the{' '}
                        <a href="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                          Terms of Service
                        </a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                          Privacy Policy
                        </a>
                        . I understand that my data will be used to provide personalized healthcare services.
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    disabled={isLoading}
                    leftIcon={isLoading ? undefined : <Shield className="w-5 h-5" />}
                    className="mt-6"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="text-center pt-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </form>
              </GlassCard>
            </div>

            {/* Right Column - Benefits */}
            <div className="space-y-6">
              <GlassCard className="p-6 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                  Why Join Healthcare AI?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <Heart className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">Personalized Health Insights</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Get AI-powered recommendations based on your health data
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <Shield className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">Secure & Private</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        HIPAA-compliant data storage with end-to-end encryption
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-white">24/7 AI Assistant</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Get instant answers to health questions anytime
                      </p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Security Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center">
                  <div className="text-2xl font-bold text-primary-600">256-bit</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Encryption</div>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center">
                  <div className="text-2xl font-bold text-primary-600">HIPAA</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">Compliant</div>
                </div>
              </div>

              {/* Stats */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                  Join Our Community
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">10K+</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">500+</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Doctors</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">98%</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">Satisfaction</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};