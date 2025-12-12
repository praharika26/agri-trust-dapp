import { describe, it, expect, vi } from 'vitest';
import { CropService } from '../../lib/services/database';
import type { CreateCropRequest } from '../../lib/types/database';

// Mock the database module
vi.mock('../../lib/database', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: {
              id: 'test-crop-id',
              farmer_id: 'test-farmer-id',
              title: 'Test Crop',
              description: 'Test Description',
              crop_type: 'wheat',
              quantity: 100,
              unit: 'kg',
              harvest_date: null,
              nft_minted: true,
              nft_token_id: '123',
              nft_transaction_hash: '0xabc123',
              nft_metadata_url: 'ipfs://metadata',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, 
            error: null 
          }))
        }))
      }))
    }))
  }
}));

describe('NFT Integration with Date Validation', () => {
  describe('NFT Creation with Date Validation', () => {
    it('should handle NFT creation with empty harvest date', async () => {
      const cropData: CreateCropRequest = {
        title: 'Premium Organic Wheat',
        description: 'High-quality organic wheat',
        crop_type: 'wheat',
        quantity: 1000,
        unit: 'kg',
        harvest_date: '', // Empty date
        location: 'Punjab, India',
        organic_certified: true,
        images: ['https://example.com/image1.jpg'],
        // NFT fields
        nft_minted: true,
        nft_token_id: '123',
        nft_transaction_hash: '0xabc123',
        nft_metadata_url: 'ipfs://metadata'
      };

      // Test that CropService properly handles both date validation and NFT fields
      const sanitizedData = CropService.sanitizeCropData(cropData);
      
      // Date should be sanitized to null
      expect(sanitizedData.harvest_date).toBe(null);
      
      // NFT fields should be preserved
      expect(sanitizedData.nft_minted).toBe(true);
      expect(sanitizedData.nft_token_id).toBe('123');
      expect(sanitizedData.nft_transaction_hash).toBe('0xabc123');
      expect(sanitizedData.nft_metadata_url).toBe('ipfs://metadata');

      // Should successfully create crop with both date validation and NFT data
      const result = await CropService.createCrop('test-farmer-id', cropData);
      expect(result).toBeDefined();
    });

    it('should handle NFT creation with valid harvest date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);
      const validDate = pastDate.toISOString().split('T')[0];

      const cropData: CreateCropRequest = {
        title: 'Premium Organic Wheat',
        description: 'High-quality organic wheat',
        crop_type: 'wheat',
        quantity: 1000,
        unit: 'kg',
        harvest_date: validDate, // Valid past date
        location: 'Punjab, India',
        organic_certified: true,
        images: ['https://example.com/image1.jpg'],
        // NFT fields
        nft_minted: true,
        nft_token_id: '456',
        nft_transaction_hash: '0xdef456',
        nft_metadata_url: 'ipfs://metadata2'
      };

      const sanitizedData = CropService.sanitizeCropData(cropData);
      
      // Date should be preserved
      expect(sanitizedData.harvest_date).toBe(validDate);
      
      // NFT fields should be preserved
      expect(sanitizedData.nft_minted).toBe(true);
      expect(sanitizedData.nft_token_id).toBe('456');
      expect(sanitizedData.nft_transaction_hash).toBe('0xdef456');
      expect(sanitizedData.nft_metadata_url).toBe('ipfs://metadata2');
    });

    it('should reject NFT creation with invalid harvest date', async () => {
      const cropData: CreateCropRequest = {
        title: 'Premium Organic Wheat',
        description: 'High-quality organic wheat',
        crop_type: 'wheat',
        quantity: 1000,
        unit: 'kg',
        harvest_date: 'invalid-date', // Invalid date
        location: 'Punjab, India',
        organic_certified: true,
        images: ['https://example.com/image1.jpg'],
        // NFT fields
        nft_minted: true,
        nft_token_id: '789',
        nft_transaction_hash: '0xghi789',
        nft_metadata_url: 'ipfs://metadata3'
      };

      // Should throw error due to invalid date, even with valid NFT data
      expect(() => CropService.sanitizeCropData(cropData)).toThrow();
    });

    it('should handle NFT creation with future harvest date (warning but allowed)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const cropData: CreateCropRequest = {
        title: 'Premium Organic Wheat',
        description: 'High-quality organic wheat',
        crop_type: 'wheat',
        quantity: 1000,
        unit: 'kg',
        harvest_date: futureDateString, // Future date (should warn but allow)
        location: 'Punjab, India',
        organic_certified: true,
        images: ['https://example.com/image1.jpg'],
        // NFT fields
        nft_minted: true,
        nft_token_id: '101',
        nft_transaction_hash: '0xjkl101',
        nft_metadata_url: 'ipfs://metadata4'
      };

      const sanitizedData = CropService.sanitizeCropData(cropData);
      
      // Future date should be preserved (warning is handled at validation level)
      expect(sanitizedData.harvest_date).toBe(futureDateString);
      
      // NFT fields should be preserved
      expect(sanitizedData.nft_minted).toBe(true);
      expect(sanitizedData.nft_token_id).toBe('101');
      expect(sanitizedData.nft_transaction_hash).toBe('0xjkl101');
      expect(sanitizedData.nft_metadata_url).toBe('ipfs://metadata4');
    });
  });

  describe('NFT Field Handling', () => {
    it('should handle crops without NFT fields', async () => {
      const cropData: CreateCropRequest = {
        title: 'Regular Crop',
        description: 'Crop without NFT',
        crop_type: 'rice',
        quantity: 500,
        unit: 'kg',
        harvest_date: '',
        location: 'Bihar, India',
        organic_certified: false,
        images: ['https://example.com/image.jpg']
        // No NFT fields
      };

      const sanitizedData = CropService.sanitizeCropData(cropData);
      
      // Should handle missing NFT fields gracefully
      expect(sanitizedData.nft_minted).toBeUndefined();
      expect(sanitizedData.nft_token_id).toBeUndefined();
      expect(sanitizedData.nft_transaction_hash).toBeUndefined();
      expect(sanitizedData.nft_metadata_url).toBeUndefined();
      
      // Date validation should still work
      expect(sanitizedData.harvest_date).toBe(null);
    });

    it('should handle partial NFT fields', async () => {
      const cropData: CreateCropRequest = {
        title: 'Partial NFT Crop',
        description: 'Crop with some NFT fields',
        crop_type: 'corn',
        quantity: 750,
        unit: 'kg',
        harvest_date: '2023-06-15',
        location: 'Maharashtra, India',
        organic_certified: true,
        images: ['https://example.com/image.jpg'],
        // Partial NFT fields
        nft_minted: true,
        nft_token_id: '202'
        // Missing nft_transaction_hash and nft_metadata_url
      };

      const sanitizedData = CropService.sanitizeCropData(cropData);
      
      // Should preserve provided NFT fields
      expect(sanitizedData.nft_minted).toBe(true);
      expect(sanitizedData.nft_token_id).toBe('202');
      
      // Missing fields should remain undefined
      expect(sanitizedData.nft_transaction_hash).toBeUndefined();
      expect(sanitizedData.nft_metadata_url).toBeUndefined();
      
      // Date validation should still work
      expect(sanitizedData.harvest_date).toBe('2023-06-15');
    });
  });

  describe('Integration Scenarios', () => {
    it('should maintain data integrity when both date validation and NFT creation succeed', async () => {
      const validDate = '2023-05-20';
      const cropData: CreateCropRequest = {
        title: 'Complete Integration Test',
        description: 'Testing both date validation and NFT creation',
        crop_type: 'soybean',
        quantity: 1200,
        unit: 'kg',
        harvest_date: validDate,
        location: 'Madhya Pradesh, India',
        organic_certified: true,
        quality_grade: 'A',
        moisture_content: 12.5,
        minimum_price: 45.00,
        starting_price: 50.00,
        buyout_price: 65.00,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        // Complete NFT fields
        nft_minted: true,
        nft_token_id: '303',
        nft_transaction_hash: '0xmno303',
        nft_metadata_url: 'ipfs://complete-metadata'
      };

      const sanitizedData = CropService.sanitizeCropData(cropData);
      
      // All original data should be preserved
      expect(sanitizedData.title).toBe(cropData.title);
      expect(sanitizedData.description).toBe(cropData.description);
      expect(sanitizedData.crop_type).toBe(cropData.crop_type);
      expect(sanitizedData.quantity).toBe(cropData.quantity);
      expect(sanitizedData.harvest_date).toBe(validDate);
      expect(sanitizedData.organic_certified).toBe(cropData.organic_certified);
      
      // NFT fields should be preserved
      expect(sanitizedData.nft_minted).toBe(true);
      expect(sanitizedData.nft_token_id).toBe('303');
      expect(sanitizedData.nft_transaction_hash).toBe('0xmno303');
      expect(sanitizedData.nft_metadata_url).toBe('ipfs://complete-metadata');
      
      // Should successfully create crop
      const result = await CropService.createCrop('test-farmer-id', cropData);
      expect(result).toBeDefined();
    });
  });
});