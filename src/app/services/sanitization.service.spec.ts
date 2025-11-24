import { TestBed } from '@angular/core/testing';
import { SanitizationService } from './sanitization.service';

describe('SanitizationService', () => {
  let service: SanitizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SanitizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sanitizeName', () => {
    it('should remove script tags', () => {
      const malicious = 'John<script>alert("xss")</script>Doe';
      expect(service.sanitizeName(malicious)).toBe('JohnDoe');
    });

    it('should allow valid names with umlauts', () => {
      const name = 'Müller-Schön';
      expect(service.sanitizeName(name)).toBe('Müller-Schön');
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate correct email', () => {
      expect(service.sanitizeEmail('test@example.com')).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      expect(service.sanitizeEmail('not-an-email')).toBeNull();
    });
  });

  describe('sanitizeAmount', () => {
    it('should round to 2 decimals', () => {
      expect(service.sanitizeAmount('10.999')).toBe(11.00);
    });

    it('should reject negative amounts', () => {
      expect(service.sanitizeAmount('-50')).toBeNull();
    });
  });
});
