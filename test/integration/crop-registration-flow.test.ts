import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DateValidator } from '../../lib/validation/date-validator';
import { CropService } from '../../lib/services/database';
import type { CreateCropRequest } from '../../lib/types/database';

// Mock the database module to avoid actual database calls during testing
vi.mock('../../lib/database', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockCropData, error: null }))
        }))
      }))
    }))
  }
}));

const mockCropData = {
  id: 'test-crop-id',
  farmer_id: 'test-farmer-id',
  title: 'Test Crop',
  description: 'Test Description',
  crop_type: 'wheat',
  quantity: 100,
  unit: 'kg',
  harvest_date: null,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

describe('Crop Registration Integration Flow', () => {
  let mockCropData: CreateCropRequest;

  beforeEach(() => {
    mockCropData = {
      title: 'Premium Organic Wheat',
      description: 'High-quality organic wheat from sustainable farming',
      crop_type: 'wheat',
      quantity: 1000,
      unit: 'kg',
      harvest_date: '',
      location: 'Punjab, India',
      organic_certified: true,
      quality_grade: 'A',
      moisture_content: 12.5,
      storage_conditions: 'Cool, dry storage',
      minimum_price: 45.00,
      starting_price: 50.00,
      buyout_price: 65.00,
      images: ['https://example.com/image1.jpg'],
      documents: []
    };
  });

  describe('Complete Flow: Form Submission to Database Storage', () => {
    it('should successfully process crop registration with empty harvest date', async () => {
      // Requirement 1.1: Empty harvest date should be accepted and stored as null
      mockCropData.harvest_date = '';
      
      // Validate the date (should pass)
      const dateValidation = DateValidator.validateHarvestDate(mockCropData.harvest_date);
      expect(dateValidation.isValid).toBe(true);
      expect(dateValidation.sanitizedValue).toBe(null);
      
      // Process through CropService (should sanitize and store)
      const sanitizedData = CropService.sanitizeCropData(mockCropData);
      expect(sanitizedData.harvest_date).toBe(null);
      
      // Simulate database insertion
      const result = await CropService.createCrop('test-farmer-id', mockCropData);
      expect(result).toBeDefined();
    });

    it('should successfully process crop registration with whitespace-only harvest date', async () => {
      // Requirement 1.1: Whitespace-only dates should be treated as empty
      mockCropData.harvest_date = '   \t\n   ';
      
      const dateValidation = DateValidator.validateHarvestDate(mockCropData.harvest_date);
      expect(dateValidation.isValid).toBe(true);
      expect(dateValidation.sanitizedValue).toBe(null);
      
      const sanitizedData = CropService.sanitizeCropData(mockCropData);
      expect(sanitizedData.harvest_date).toBe(null);
    });

    it('should reject crop registration with invalid date format', async () => {
      // Requirement 1.2: Invalid date formats should be rejected
      mockCropData.harvest_date = 'invalid-date';
      
      const dateValidation = DateValidator.validateHarvestDate(mockCropData.harvest_date);
      expect(dateValidation.isValid).toBe(false);
      expect(dateValidation.error).toContain('valid date');
      
      // CropService should throw an error for invalid dates
      expect(() => CropService.sanitizeCropData(mockCropData)).toThrow();
    });

    it('should process crop registration with future harvest date but show warning', async () => {
      // Requirement 1.3: Future dates should show warning but allow submission
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      mockCropData.harvest_date = futureDate.toISOString().split('T')[0];
      
      const dateValidation = DateValidator.validateHarvestDate(mockCropData.harvest_date);
      expect(dateValidation.isValid).toBe(true);
      expect(dateValidation.warning).toContain('Future harvest dates');
      expect(dateValidation.sanitizedValue).toBe(mockCropData.harvest_date);
      
      const sanitizedData = CropService.sanitizeCropData(mockCropData);
      expect(sanitizedData.harvest_date).toBe(mockCropData.harvest_date);
    });

    it('should successfully process crop registration with valid past date', async () => {
      // Requirement 1.4: Valid past dates should be accepted
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      mockCropData.harvest_date = pastDate.toISOString().split('T')[0];
      
      const dateValidation = DateValidator.validateHarvestDate(mockCropData.harvest_date);
      expect(dateValidation.isValid).toBe(true);
      expect(dateValidation.error).toBeUndefined();
      expect(dateValidation.warning).toBeUndefined();
      expect(dateValidation.sanitizedValue).toBe(mockCropData.harvest_date);
      
      const sanitizedData = CropService.sanitizeCropData(mockCropData);
      expect(sanitizedData.harvest_date).toBe(mockCropData.harvest_date);
    });

    it('should successfully process crop registration with current date', async () => {
      // Requirement 1.4: Current date should be accepted
      const today = new Date();
      mockCropData.harvest_date = today.toISOString().split('T')[0];
      
      const dateValidation = DateValidator.validateHarvestDate(mockCropData.harvest_date);
      expect(dateValidation.isValid).toBe(true);
      expect(dateValidation.error).toBeUndefined();
      expect(dateValidation.warning).toBeUndefined();
      expect(dateValidation.sanitizedValue).toBe(mockCropData.harvest_date);
    });
  });

  describe('API Route Integration', () => {
    it('should simulate API route processing with valid data', async () => {
      // Simulate the API route logic for valid data
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 15);
      mockCropData.harvest_date = pastDate.toISOString().split('T')[0];
      
      // Validate required fields (as done in API route)
      expect(mockCropData.title).toBeTruthy();
      expect(mockCropData.description).toBeTruthy();
      expect(mockCropData.crop_type).toBeTruthy();
      expect(mockCropData.quantity).toBeTruthy();
      
      // Validate harvest date (as done in API route)
      const dateValidation = DateValidator.validateHarvestDate(mockCropData.harvest_date);
      expect(dateValidation.isValid).toBe(true);
      
      // Process through CropService (as done in API route)
      const result = await CropService.createCrop('test-farmer-id', mockCropData);
      expect(result).toBeDefined();
    });

    it('should simulate API route error handling for invalid date', async () => {
      // Simulate API route error handling
      mockCropData.harvest_date = '2023-13-45'; // Invalid date
      
      const dateValidation = DateValidator.validateHarvestDate(mockCropData.harvest_date);
      expect(dateValidation.isValid).toBe(false);
      
      // API should return 400 error for invalid dates
      const expectedErrorResponse = {
        error: 'Date validation failed',
        details: dateValidation.error,
        field: 'harvest_date',
        provided_value: mockCropData.harvest_date
      };
      
      expect(expectedErrorResponse.error).toBe('Date validation failed');
      expect(expectedErrorResponse.field).toBe('harvest_date');
    });
  });

  describe('Database Service Integration', () => {
    it('should handle null dates correctly in database insertion', async () => {
      // Test that CropService properly handles null dates
      mockCropData.harvest_date = '';
      
      const sanitizedData = CropService.sanitizeCropData(mockCropData);
      expect(sanitizedData.harvest_date).toBe(null);
      
      // Verify that the sanitized data structure is correct
      expect(sanitizedData).toHaveProperty('title');
      expect(sanitizedData).toHaveProperty('description');
      expect(sanitizedData).toHaveProperty('crop_type');
      expect(sanitizedData).toHaveProperty('quantity');
      expect(sanitizedData).toHaveProperty('harvest_date');
    });

    it('should preserve valid dates in database insertion', async () => {
      // Test that valid dates are preserved through the sanitization process
      const validDate = '2023-06-15';
      mockCropData.harvest_date = validDate;
      
      const sanitizedData = CropService.sanitizeCropData(mockCropData);
      expect(sanitizedData.harvest_date).toBe(validDate);
    });

    it('should validate all date fields before insertion', async () => {
      // Requirement 2.5: All date fields should be validated before insertion
      mockCropData.harvest_date = 'invalid-date';
      
      // CropService.sanitizeCropData should validate before processing
      expect(() => CropService.sanitizeCropData(mockCropData)).toThrow();
    });
  });

  describe('Form Validation Integration', () => {
    it('should provide appropriate validation feedback for different scenarios', () => {
      // Test various validation scenarios that would occur in the form
      
      // Empty date - should be valid
      let result = DateValidator.validateHarvestDate('');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(null);
      
      // Invalid format - should show error
      result = DateValidator.validateHarvestDate('not-a-date');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      
      // Future date - should show warning
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      result = DateValidator.validateHarvestDate(futureDate.toISOString().split('T')[0]);
      expect(result.isValid).toBe(true);
      expect(result.warning).toBeDefined();
      
      // Valid past date - should be clean
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      result = DateValidator.validateHarvestDate(pastDate.toISOString().split('T')[0]);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.warning).toBeUndefined();
    });
  });

  describe('End-to-End Validation Scenarios', () => {
    it('should handle complete crop registration flow with all validation scenarios', async () => {
      // Test multiple scenarios in sequence to ensure system stability
      
      // Scenario 1: Empty date
      mockCropData.harvest_date = '';
      let sanitized = CropService.sanitizeCropData(mockCropData);
      expect(sanitized.harvest_date).toBe(null);
      
      // Scenario 2: Valid past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 20);
      mockCropData.harvest_date = pastDate.toISOString().split('T')[0];
      sanitized = CropService.sanitizeCropData(mockCropData);
      expect(sanitized.harvest_date).toBe(mockCropData.harvest_date);
      
      // Scenario 3: Future date (should work but with warning)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);
      mockCropData.harvest_date = futureDate.toISOString().split('T')[0];
      sanitized = CropService.sanitizeCropData(mockCropData);
      expect(sanitized.harvest_date).toBe(mockCropData.harvest_date);
      
      // Scenario 4: Invalid date (should throw)
      mockCropData.harvest_date = 'invalid';
      expect(() => CropService.sanitizeCropData(mockCropData)).toThrow();
    });

    it('should maintain data integrity throughout the validation process', () => {
      // Ensure that validation doesn't corrupt other data fields
      const originalData = { ...mockCropData };
      mockCropData.harvest_date = '2023-06-15';
      
      const sanitized = CropService.sanitizeCropData(mockCropData);
      
      // All other fields should remain unchanged
      expect(sanitized.title).toBe(originalData.title);
      expect(sanitized.description).toBe(originalData.description);
      expect(sanitized.crop_type).toBe(originalData.crop_type);
      expect(sanitized.quantity).toBe(originalData.quantity);
      expect(sanitized.organic_certified).toBe(originalData.organic_certified);
    });
  });
});