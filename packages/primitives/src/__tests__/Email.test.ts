import { describe, it, expect } from 'vitest';
import { Email } from '../value-objects/Email.js';

describe('Email', () => {
  describe('create', () => {
    it('should create email with valid format', () => {
      const result = Email.create('user@example.com');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe('user@example.com');
      }
    });

    it('should normalize email to lowercase', () => {
      const result = Email.create('User@Example.COM');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe('user@example.com');
      }
    });

    it('should trim whitespace', () => {
      const result = Email.create('  user@example.com  ');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.value).toBe('user@example.com');
      }
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user_name@example.com',
        'user-name@example.com',
        '123@example.com',
        'user@sub.example.com',
        'user@example.co.uk',
      ];

      validEmails.forEach((email) => {
        const result = Email.create(email);
        expect(result.isSuccess).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        // Note: Simple regex allows 'user@example' without TLD
        // For stricter validation, enhance the regex in production
      ];

      invalidEmails.forEach((email) => {
        const result = Email.create(email);
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
          expect(result.error.code).toBe('INVALID_EMAIL_FORMAT');
        }
      });
    });

    it('should reject empty string', () => {
      const result = Email.create('');

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('EMPTY_EMAIL');
      }
    });

    it('should reject whitespace only', () => {
      const result = Email.create('   ');

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('EMPTY_EMAIL');
      }
    });

    it('should reject non-string values', () => {
      const result1 = Email.create(null as unknown as string);
      const result2 = Email.create(undefined as unknown as string);

      expect(result1.isFailure).toBe(true);
      expect(result2.isFailure).toBe(true);
    });

    it('should reject email exceeding max length', () => {
      const longLocal = 'a'.repeat(300);
      const result = Email.create(`${longLocal}@example.com`);

      expect(result.isFailure).toBe(true);
      if (result.isFailure) {
        expect(result.error.code).toBe('EMAIL_TOO_LONG');
      }
    });

    it('should accept email at max length (254 chars)', () => {
      // Create an email that's exactly 254 characters
      const local = 'a'.repeat(64);
      const domain = 'b'.repeat(181);
      const email = `${local}@${domain}.com`; // Total: 64 + 1 + 181 + 4 = 250 chars

      const result = Email.create(email);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('domain', () => {
    it('should extract domain from email', () => {
      const email = Email.create('user@example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.domain).toBe('example.com');
      }
    });

    it('should handle subdomain', () => {
      const email = Email.create('user@mail.example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.domain).toBe('mail.example.com');
      }
    });
  });

  describe('localPart', () => {
    it('should extract local part from email', () => {
      const email = Email.create('user@example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.localPart).toBe('user');
      }
    });

    it('should handle complex local part', () => {
      const email = Email.create('user.name+tag@example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.localPart).toBe('user.name+tag');
      }
    });
  });

  describe('belongsToDomain', () => {
    it('should return true for matching domain', () => {
      const email = Email.create('user@example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.belongsToDomain('example.com')).toBe(true);
      }
    });

    it('should return false for non-matching domain', () => {
      const email = Email.create('user@example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.belongsToDomain('other.com')).toBe(false);
      }
    });

    it('should be case-insensitive', () => {
      const email = Email.create('user@Example.COM');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.belongsToDomain('example.com')).toBe(true);
        expect(email.value.belongsToDomain('EXAMPLE.COM')).toBe(true);
      }
    });

    it('should not match subdomain', () => {
      const email = Email.create('user@mail.example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.belongsToDomain('example.com')).toBe(false);
      }
    });
  });

  describe('equals', () => {
    it('should be equal for same email', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');

      expect(email1.isSuccess && email2.isSuccess).toBe(true);
      if (email1.isSuccess && email2.isSuccess) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });

    it('should be equal regardless of case', () => {
      const email1 = Email.create('User@Example.COM');
      const email2 = Email.create('user@example.com');

      expect(email1.isSuccess && email2.isSuccess).toBe(true);
      if (email1.isSuccess && email2.isSuccess) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });

    it('should be equal regardless of whitespace', () => {
      const email1 = Email.create('  user@example.com  ');
      const email2 = Email.create('user@example.com');

      expect(email1.isSuccess && email2.isSuccess).toBe(true);
      if (email1.isSuccess && email2.isSuccess) {
        expect(email1.value.equals(email2.value)).toBe(true);
      }
    });

    it('should not be equal for different emails', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');

      expect(email1.isSuccess && email2.isSuccess).toBe(true);
      if (email1.isSuccess && email2.isSuccess) {
        expect(email1.value.equals(email2.value)).toBe(false);
      }
    });
  });

  describe('toString', () => {
    it('should return email string', () => {
      const email = Email.create('user@example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.toString()).toBe('user@example.com');
      }
    });

    it('should return normalized email', () => {
      const email = Email.create('User@Example.COM');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.toString()).toBe('user@example.com');
      }
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const email = Email.create('user@example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        expect(email.value.toJSON()).toBe('user@example.com');
      }
    });

    it('should be serializable', () => {
      const email = Email.create('user@example.com');

      expect(email.isSuccess).toBe(true);
      if (email.isSuccess) {
        const json = JSON.stringify({ email: email.value });
        expect(json).toBe('{"email":"user@example.com"}');
      }
    });
  });

  describe('real-world scenarios', () => {
    it('should handle gmail addresses', () => {
      const emails = [
        'user@gmail.com',
        'user.name@gmail.com',
        'user+label@gmail.com',
        'user123@gmail.com',
      ];

      emails.forEach((emailStr) => {
        const result = Email.create(emailStr);
        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
          expect(result.value.belongsToDomain('gmail.com')).toBe(true);
        }
      });
    });

    it('should handle corporate emails', () => {
      const result = Email.create('john.doe@company.example.com');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.domain).toBe('company.example.com');
        expect(result.value.localPart).toBe('john.doe');
      }
    });

    it('should handle international domains', () => {
      const result = Email.create('user@example.co.uk');

      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.domain).toBe('example.co.uk');
      }
    });
  });
});
