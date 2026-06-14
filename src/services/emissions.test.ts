import { describe, test, expect } from 'vitest';
import { 
  calculateTransportEmissions, 
  calculateElectricityEmissions, 
  calculateWaterEmissions, 
  calculateFoodEmissions, 
  calculateWasteEmissions, 
  calculateSustainabilityScore 
} from './emissions';

describe('Carbon Footprint Emission Engine', () => {

  describe('Transportation Emissions', () => {
    test('should calculate correct emissions for Petrol Car', () => {
      expect(calculateTransportEmissions('car_petrol', 50)).toBe(9.6);
      expect(calculateTransportEmissions('car_petrol', 0)).toBe(0);
    });

    test('should calculate correct emissions for Electric Vehicle (EV)', () => {
      expect(calculateTransportEmissions('ev', 100)).toBe(5.3);
    });

    test('should calculate correct emissions for transit flights', () => {
      expect(calculateTransportEmissions('flight', 1500)).toBe(225.0);
    });

    test('should return zero emissions for walking or cycling', () => {
      expect(calculateTransportEmissions('walk_bike', 10)).toBe(0);
    });
  });

  describe('Utility Consumption Emissions', () => {
    test('should calculate electricity footprint correctly based on grid factors', () => {
      expect(calculateElectricityEmissions(120)).toBe(50.4); // 120 * 0.42 = 50.4
    });

    test('should calculate water treatment footprint correctly', () => {
      expect(calculateWaterEmissions(1500)).toBe(0.45); // 1500 * 0.0003 = 0.45
    });
  });

  describe('Diet & Waste Habits Footprints', () => {
    test('should compute correct daily diet footprints', () => {
      expect(calculateFoodEmissions('vegan')).toBe(2.9);
      expect(calculateFoodEmissions('heavy_meat', 7)).toBe(50.4); // 7.2 * 7 = 50.4
    });

    test('should compute waste footprint incorporating recycling and composting offsets', () => {
      // (10 * 0.52) + (5 * 0.12) + (3 * 0.05) = 5.2 + 0.6 + 0.15 = 5.95
      expect(calculateWasteEmissions(10, 5, 3)).toBe(5.95);
    });
  });

  describe('Sustainability Score Mapping', () => {
    test('should map low footprints to high eco scores', () => {
      expect(calculateSustainabilityScore(100)).toBe(90); // Under target (200)
    });

    test('should map standard footprints to average scores', () => {
      expect(calculateSustainabilityScore(325)).toBe(65); // Between target and average
    });

    test('should map excessive footprints to low score ratings', () => {
      expect(calculateSustainabilityScore(700)).toBe(29); // Decays towards 0
    });

    test('should yield 100 for zero footprint profiles', () => {
      expect(calculateSustainabilityScore(0)).toBe(100);
    });
  });

});
