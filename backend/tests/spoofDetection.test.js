import { describe, it, expect, beforeEach } from 'vitest';
import { detectGpsSpoofing } from '../utils/spoofDetection.js';
import { calculateDistance } from '../utils/geoUtils.js';

// Mock the LocationHistory model
vi.mock('../models/locationHistoryModel.js', () => {
  return {
    default: {
      findOne: vi.fn().mockImplementation(() => ({
        sort: vi.fn().mockImplementation(() => ({
          // Mock a previous location (Mumbai office)
          latitude: 19.07609,
          longitude: 72.87723,
          timestamp: new Date(Date.now() - 60000) // 1 minute ago
        }))
      })),
      find: vi.fn().mockImplementation(() => ({
        sort: vi.fn().mockImplementation(() => ({
          limit: vi.fn().mockReturnValue([])
        }))
      }))
    }
  };
});

describe('Spoof Detection Tests', () => {
  beforeEach(() => {
    // Clear mocks between tests
    vi.clearAllMocks();
  });
  
  it('should detect teleportation spoofing', async () => {
    // Test location in Delhi (very far from Mumbai)
    const userId = 'user123';
    const newLocation = {
      latitude: 28.7041,
      longitude: 77.1025,
      timestamp: new Date()
    };
    
    // Calculate actual distance (should be around 1153 km)
    const distance = calculateDistance(19.07609, 72.87723, 28.7041, 77.1025);
    console.log(`Distance between locations: ${distance / 1000} km`);
    
    const result = await detectGpsSpoofing(userId, newLocation);
    
    expect(result.isSpoofed).toBe(true);
    expect(result.reason).toContain('speed_spoofing');
  });
  
  it('should not detect spoofing for reasonable movement', async () => {
    // Test location very close to Mumbai office
    const userId = 'user123';
    const newLocation = {
      latitude: 19.07700, // Very close to previous location
      longitude: 72.87800,
      timestamp: new Date()
    };
    
    const result = await detectGpsSpoofing(userId, newLocation);
    
    expect(result.isSpoofed).toBe(false);
  });
  
  it('should detect accuracy spoofing when accuracy is suspiciously high', async () => {
    const userId = 'user123';
    const newLocation = {
      latitude: 19.07700,
      longitude: 72.87800,
      accuracy: 0, // Perfect accuracy is suspicious
      timestamp: new Date()
    };
    
    const result = await detectGpsSpoofing(userId, newLocation);
    
    expect(result.isSpoofed).toBe(true);
    expect(result.reason).toContain('accuracy_spoofing');
  });
  
  it('should detect accuracy spoofing when accuracy is very low', async () => {
    const userId = 'user123';
    const newLocation = {
      latitude: 19.07700,
      longitude: 72.87800,
      accuracy: 2000, // Very poor accuracy is suspicious
      timestamp: new Date()
    };
    
    const result = await detectGpsSpoofing(userId, newLocation);
    
    expect(result.isSpoofed).toBe(true);
    expect(result.reason).toContain('accuracy_spoofing');
  });
});
