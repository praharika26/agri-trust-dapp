import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { DateValidator, DateValidationResult } from '@/lib/validation/date-validator';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (result: DateValidationResult) => void;
  label: string;
  id: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  value,
  onChange,
  onValidation,
  label,
  id,
  name,
  required = false,
  placeholder,
  className = '',
}) => {
  const [validationResult, setValidationResult] = useState<DateValidationResult>({
    isValid: true,
    sanitizedValue: null,
  });
  const [touched, setTouched] = useState(false);

  // Validate on value change
  useEffect(() => {
    if (touched || value) {
      const result = DateValidator.validateHarvestDate(value);
      setValidationResult(result);
      onValidation?.(result);
    }
  }, [value, touched, onValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = touched && validationResult.error;
  const showWarning = touched && validationResult.warning && !validationResult.error;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          name={name}
          type="date"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`
            ${showError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${showWarning ? 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500' : ''}
          `}
          required={required}
        />
      </div>

      {/* Error Message */}
      {showError && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{validationResult.error}</span>
        </div>
      )}

      {/* Warning Message */}
      {showWarning && (
        <div className="flex items-center gap-2 text-sm text-yellow-600">
          <AlertTriangle className="w-4 h-4" />
          <span>{validationResult.warning}</span>
        </div>
      )}

      {/* Helper Text */}
      {!showError && !showWarning && (
        <p className="text-sm text-gray-500">
          {required ? 'Enter the harvest date (optional)' : 'Optional - leave blank if not applicable'}
        </p>
      )}
    </div>
  );
};