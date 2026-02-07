import { Email } from './email.vo';

describe('Email Value Object', () => {
  describe('유효한 이메일', () => {
    it('should create email with valid format', () => {
      const email = Email.create('user@example.com');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should create email with subdomain', () => {
      const email = Email.create('test.user@sub.domain.com');
      expect(email.getValue()).toBe('test.user@sub.domain.com');
    });

    it('should create email with plus addressing', () => {
      const email = Email.create('user+tag@example.com');
      expect(email.getValue()).toBe('user+tag@example.com');
    });
  });

  describe('정규화', () => {
    it('should normalize to lowercase', () => {
      const email = Email.create('User@Example.COM');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  user@example.com  ');
      expect(email.getValue()).toBe('user@example.com');
    });

    it('should normalize and trim together', () => {
      const email = Email.create('  User@Example.COM  ');
      expect(email.getValue()).toBe('user@example.com');
    });
  });

  describe('무효한 이메일', () => {
    it('should throw error for missing local part', () => {
      expect(() => Email.create('@example.com')).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('should throw error for missing domain', () => {
      expect(() => Email.create('user@')).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('should throw error for missing @ symbol', () => {
      expect(() => Email.create('user')).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('should throw error for whitespace in email', () => {
      expect(() => Email.create('user @example.com')).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('should throw error for empty string', () => {
      expect(() => Email.create('')).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('should throw error for multiple @ symbols', () => {
      expect(() => Email.create('user@@example.com')).toThrow('INVALID_EMAIL_FORMAT');
    });
  });

  describe('동등성', () => {
    it('should be equal for same email values', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should be equal after normalization', () => {
      const email1 = Email.create('User@Example.COM');
      const email2 = Email.create('user@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal for different email values', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
