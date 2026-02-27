import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface MedicalDisclaimerProps {
  className?: string;
  variant?: 'default' | 'critical';
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  className = '',
  variant = 'default'
}) => {
  if (variant === 'critical') {
    return (
      <div className={`bg-error-50 border border-error-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-error-800">
              Emergency Medical Notice
            </h3>
            <p className="mt-1 text-sm text-error-700">
              This is an AI-powered decision support tool only. For medical emergencies, 
              call emergency services immediately. Always consult with qualified healthcare 
              professionals for diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-warning-50 border border-warning-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-semibold text-warning-800">
            Medical Disclaimer
          </h3>
          <p className="mt-1 text-sm text-warning-700">
            This AI tool provides decision support only, not medical diagnosis. 
            Always consult with healthcare professionals for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};