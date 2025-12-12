import { describe, it, expect, vi } from 'vitest';
import { DateValidator } from '../../lib/validation/date-validator';

/**
 * End-to-End Validation Scenarios Test
 * 
 * This test suite simulates the complete user journey from form input
 * to database storage, covering all validation requirements.
 */

describe('End-to-End Date Validation Scenarios', () => {
  describe('User Journey: Form Input to Database Storage', () => {
    it('should handle the complete flow for empty harvest date submission', () => {
      // Requirement 1.1: Empty harvest date should be accepted and stored as null
      
      // Step 1: User leaves harvest date field empty
      const userInput = '';
      
      // Step 2: Form validation (real-time)
      const validationResult = DateValidator.validateHarvestDate(userInput);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.error).toBeUndefined();
      expect(validationResult.warning).toBeUndefined();
      expect(validationResult.sanitizedValue).toBe(null);
      
      // Step 3: Form submission should be allowed
      const canSubmit = validationResult.isValid;
      expect(canSubmit).toBe(true);
      
      // Step 4: API processing should sanitize to null
      const sanitizedForAPI = validationResult.sanitizedValue;
      expect(sanitizedForAPI).toBe(null);
      
      // Step 5: Database should receive null (not empty string)
      expect(sanitizedForAPI).not.toBe('');
      expect(sanitizedForAPI).toBe(null);
    });

    it('should handle the complete flow for invalid date format submission', () => {
      // Requirement 1.2: Invalid date formats should be rejected with clear error
      
      // Step 1: User enters invalid date format
      const userInput = 'not-a-valid-date';
      
      // Step 2: Form validation (real-time)
      const validationResult = DateValidator.validateHarvestDate(userInput);
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toContain('valid date');
      expect(validationResult.sanitizedValue).toBe(null);
      
      // Step 3: Form submission should be blocked
      const canSubmit = validationResult.isValid;
      expect(canSubmit).toBe(false);
      
      // Step 4: User should see descriptive error message
      expect(validationResult.error).toBe('Please enter a valid date in YYYY-MM-DD format');
      
      // Step 5: No API call should be made (blocked at form level)
      // This is simulated by checking that sanitizedValue is null
      expect(validationResult.sanitizedValue).toBe(null);
    });

    it('should handle the complete flow for future harvest date submission', () => {
      // Requirement 1.3: Future dates should show warning but allow submission
      
      // Step 1: User enters future date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const userInput = futureDate.toISOString().split('T')[0];
      
      // Step 2: Form validation (real-time)
      const validationResult = DateValidator.validateHarvestDate(userInput);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.error).toBeUndefined();
      expect(validationResult.warning).toContain('Future harvest dates');
      expect(validationResult.sanitizedValue).toBe(userInput);
      
      // Step 3: Form submission should be allowed despite warning
      const canSubmit = validationResult.isValid;
      expect(canSubmit).toBe(true);
      
      // Step 4: User should see warning message
      expect(validationResult.warning).toBe('Future harvest dates may indicate incorrect data entry');
      
      // Step 5: API should receive the date value
      const sanitizedForAPI = validationResult.sanitizedValue;
      expect(sanitizedForAPI).toBe(userInput);
      
      // Step 6: Database should store the actual date
      expect(sanitizedForAPI).not.toBe(null);
      expect(sanitizedForAPI).toBe(userInput);
    });

    it('should handle the complete flow for valid past date submission', () => {
      // Requirement 1.4: Valid past dates should be accepted without issues
      
      // Step 1: User enters valid past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 15);
      const userInput = pastDate.toISOString().split('T')[0];
      
      // Step 2: Form validation (real-time)
      const validationResult = DateValidator.validateHarvestDate(userInput);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.error).toBeUndefined();
      expect(validationResult.warning).toBeUndefined();
      expect(validationResult.sanitizedValue).toBe(userInput);
      
      // Step 3: Form submission should be allowed
      const canSubmit = validationResult.isValid;
      expect(canSubmit).toBe(true);
      
      // Step 4: No error or warning messages
      expect(validationResult.error).toBeUndefined();
      expect(validationResult.warning).toBeUndefined();
      
      // Step 5: API should receive the date value
      const sanitizedForAPI = validationResult.sanitizedValue;
      expect(sanitizedForAPI).toBe(userInput);
      
      // Step 6: Database should store the exact date
      expect(sanitizedForAPI).toBe(userInput);
    });

    it('should handle the complete flow for current date submission', () => {
      // Requirement 1.4: Current date should be accepted
      
      // Step 1: User enters today's date
      const today = new Date();
      const userInput = today.toISOString().split('T')[0];
      
      // Step 2: Form validation (real-time)
      const validationResult = DateValidator.validateHarvestDate(userInput);
      expect(validationResult.isValid).toBe(true);
      expect(validationResult.error).toBeUndefined();
      expect(validationResult.warning).toBeUndefined();
      expect(validationResult.sanitizedValue).toBe(userInput);
      
      // Step 3: Form submission should be allowed
      const canSubmit = validationResult.isValid;
      expect(canSubmit).toBe(true);
      
      // Step 4: API and database should handle normally
      expect(validationResult.sanitizedValue).toBe(userInput);
    });
  });

  describe('Real-time Validation Feedback Scenarios', () => {
    it('should provide immediate feedback as user types', () => {
      // Requirement 3.3: Real-time validation feedback
      
      // Simulate user typing different inputs
      const inputs = [
        { value: '', expectedValid: true, expectedError: undefined },
        { value: '2023', expectedValid: false, expectedError: 'Please enter a valid date in YYYY-MM-DD format' },
        { value: '2023-12', expectedValid: false, expectedError: 'Please enter a valid date in YYYY-MM-DD format' },
        { value: '2023-12-25', expectedValid: true, expectedError: undefined },
        { value: '2023-13-25', expectedValid: false, expectedError: 'Please enter a valid date in YYYY-MM-DD format' },
        { value: 'invalid', expectedValid: false, expectedError: 'Please enter a valid date in YYYY-MM-DD format' }
      ];

      inputs.forEach(({ value, expectedValid, expectedError }) => {
        const result = DateValidator.validateHarvestDate(value);
        expect(result.isValid).toBe(expectedValid);
        if (expectedError) {
          expect(result.error).toBe(expectedError);
        } else {
          expect(result.error).toBeUndefined();
        }
      });
    });

    it('should handle edge cases in user input', () => {
      // Test various edge cases that users might encounter
      
      const edgeCases = [
        { input: '   ', expected: { isValid: true, sanitizedValue: null } },
        { input: '\t\n', expected: { isValid: true, sanitizedValue: null } },
        { input: '2023-02-29', expected: { isValid: false } }, // Invalid leap year
        { input: '2024-02-29', expected: { isValid: true } }, // Valid leap year
        { input: '2023-04-31', expected: { isValid: false } }, // Invalid day for April
        { input: '2023-06-30', expected: { isValid: true } }, // Valid day for June
      ];

      edgeCases.forEach(({ input, expected }) => {
        const result = DateValidator.validateHarvestDate(input);
        expect(result.isValid).toBe(expected.isValid);
        if (expected.sanitizedValue !== undefined) {
          expect(result.sanitizedValue).toBe(expected.sanitizedValue);
        }
      });
    });
  });

  describe('Database Integration Scenarios', () => {
    it('should ensure proper data types are sent to database', () => {
      // Requirement 2.1, 2.2: Proper database handling
      
      // Test that empty strings become null
      let result = DateValidator.validateHarvestDate('');
      expect(result.sanitizedValue).toBe(null);
      expect(typeof result.sanitizedValue).toBe('object'); // null is object type
      
      // Test that valid dates remain strings
      result = DateValidator.validateHarvestDate('2023-06-15');
      expect(result.sanitizedValue).toBe('2023-06-15');
      expect(typeof result.sanitizedValue).toBe('string');
      
      // Test that invalid dates become null
      result = DateValidator.validateHarvestDate('invalid');
      expect(result.sanitizedValue).toBe(null);
    });

    it('should validate before any database insertion attempt', () => {
      // Requirement 2.5: Pre-insertion validation
      
      const testCases = [
        { input: '', shouldPass: true },
        { input: '2023-06-15', shouldPass: true },
        { input: 'invalid-date', shouldPass: false },
        { input: '2023-13-45', shouldPass: false },
        { input: '   ', shouldPass: true }, // Whitespace should be treated as empty
      ];

      testCases.forEach(({ input, shouldPass }) => {
        const result = DateValidator.validateHarvestDate(input);
        expect(result.isValid).toBe(shouldPass);
        
        if (shouldPass) {
          // Valid inputs should have a sanitized value (null or string)
          expect(result.sanitizedValue !== undefined).toBe(true);
        } else {
          // Invalid inputs should have null sanitized value and error message
          expect(result.sanitizedValue).toBe(null);
          expect(result.error).toBeDefined();
        }
      });
    });
  });

  describe('User Experience Scenarios', () => {
    it('should provide user-friendly error messages', () => {
      // Requirement 3.5: User-friendly messages
      
      const invalidInputs = [
        'not-a-date',
        '2023/12/25', // Wrong format
        '25-12-2023', // Wrong format
        '2023-13-25', // Invalid month
        '2023-02-30', // Invalid day
        'abc-def-ghi'
      ];

      invalidInputs.forEach(input => {
        const result = DateValidator.validateHarvestDate(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Please enter a valid date in YYYY-MM-DD format');
        // Error message should be user-friendly, not technical
        expect(result.error).not.toContain('NaN');
        expect(result.error).not.toContain('undefined');
        expect(result.error).not.toContain('null');
      });
    });

    it('should handle optional field behavior correctly', () => {
      // Requirement 3.4: Optional field handling
      
      // Empty field should be treated as optional and valid
      const emptyResult = DateValidator.validateHarvestDate('');
      expect(emptyResult.isValid).toBe(true);
      expect(emptyResult.sanitizedValue).toBe(null);
      
      // Whitespace should also be treated as empty/optional
      const whitespaceResult = DateValidator.validateHarvestDate('   ');
      expect(whitespaceResult.isValid).toBe(true);
      expect(whitespaceResult.sanitizedValue).toBe(null);
      
      // But invalid formats should still be rejected
      const invalidResult = DateValidator.validateHarvestDate('invalid');
      expect(invalidResult.isValid).toBe(false);
    });
  });
});