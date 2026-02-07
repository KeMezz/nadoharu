import { User } from './user.entity';
import { AccountId } from '../value-objects/account-id.vo';
import { Email } from '../value-objects/email.vo';
import { AccountIdError } from '../errors/account-id.error';

describe('User Entity', () => {
  describe('create() 팩토리 메서드', () => {
    it('유효한 정보로 User를 생성해야 한다', () => {
      // given
      const props = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '홍길동',
        passwordHash: '$2b$10$hashedpassword',
      };

      // when
      const user = User.create(props);

      // then
      expect(user.getId()).toBeTruthy();
      expect(user.getId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i); // UUID v4 형식
      expect(user.getAccountId()).toBeInstanceOf(AccountId);
      expect(user.getAccountId().getValue()).toBe('user_123');
      expect(user.getEmail()).toBeInstanceOf(Email);
      expect(user.getEmail().getValue()).toBe('test@example.com');
      expect(user.getName()).toBe('홍길동');
      expect(user.getPasswordHash()).toBe('$2b$10$hashedpassword');
      expect(user.getCreatedAt()).toBeInstanceOf(Date);
      expect(user.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('id, createdAt, updatedAt을 자동으로 생성해야 한다', () => {
      // given
      const props = {
        accountId: 'user_456',
        email: 'auto@example.com',
        name: '자동생성',
        passwordHash: '$2b$10$hashedpassword',
      };

      // when
      const user1 = User.create(props);
      const user2 = User.create(props);

      // then - 각 인스턴스는 고유한 ID를 가져야 함
      expect(user1.getId()).not.toBe(user2.getId());
      // createdAt과 updatedAt은 거의 동시에 생성되지만 동일해야 함
      expect(user1.getCreatedAt().getTime()).toBeLessThanOrEqual(
        Date.now() + 1000,
      );
      expect(user1.getUpdatedAt().getTime()).toBeLessThanOrEqual(
        Date.now() + 1000,
      );
    });

    it('AccountId VO의 검증을 위임해야 한다', () => {
      // given - 무효한 accountId (너무 짧음)
      const props = {
        accountId: 'ab', // 3자 미만
        email: 'test@example.com',
        name: '홍길동',
        passwordHash: '$2b$10$hashedpassword',
      };

      // when & then
      expect(() => User.create(props)).toThrow(AccountIdError);
    });

    it('Email VO의 검증을 위임해야 한다', () => {
      // given - 무효한 email
      const props = {
        accountId: 'user_123',
        email: 'invalid-email', // @ 없음
        name: '홍길동',
        passwordHash: '$2b$10$hashedpassword',
      };

      // when & then
      expect(() => User.create(props)).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('name이 빈 문자열이면 NAME_REQUIRED 에러를 던져야 한다', () => {
      // given
      const props = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '',
        passwordHash: '$2b$10$hashedpassword',
      };

      // when & then
      expect(() => User.create(props)).toThrow('NAME_REQUIRED');
    });

    it('name이 공백만 있으면 NAME_REQUIRED 에러를 던져야 한다', () => {
      // given
      const props = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '   ',
        passwordHash: '$2b$10$hashedpassword',
      };

      // when & then
      expect(() => User.create(props)).toThrow('NAME_REQUIRED');
    });

    it('name이 50자이면 통과해야 한다', () => {
      // given - 정확히 50자
      const props = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: 'a'.repeat(50),
        passwordHash: '$2b$10$hashedpassword',
      };

      // when & then
      expect(() => User.create(props)).not.toThrow();
      const user = User.create(props);
      expect(user.getName()).toBe('a'.repeat(50));
    });

    it('name이 51자이면 NAME_TOO_LONG 에러를 던져야 한다', () => {
      // given - 51자
      const props = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: 'a'.repeat(51),
        passwordHash: '$2b$10$hashedpassword',
      };

      // when & then
      expect(() => User.create(props)).toThrow('NAME_TOO_LONG');
    });
  });

  describe('reconstitute() 팩토리 메서드', () => {
    it('DB 데이터로 User를 재구성해야 한다', () => {
      // given
      const props = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        accountId: 'user_789',
        email: 'db@example.com',
        name: 'DB사용자',
        passwordHash: '$2b$10$dbhashedpassword',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      // when
      const user = User.reconstitute(props);

      // then - 모든 필드가 정확히 복원되어야 함
      expect(user.getId()).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(user.getAccountId().getValue()).toBe('user_789');
      expect(user.getEmail().getValue()).toBe('db@example.com');
      expect(user.getName()).toBe('DB사용자');
      expect(user.getPasswordHash()).toBe('$2b$10$dbhashedpassword');
      expect(user.getCreatedAt()).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(user.getUpdatedAt()).toEqual(new Date('2024-01-02T00:00:00Z'));
    });

    it('reconstitute 시에도 AccountId VO 검증을 수행해야 한다', () => {
      // given - 무효한 accountId
      const props = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        accountId: 'ab', // 너무 짧음
        email: 'db@example.com',
        name: 'DB사용자',
        passwordHash: '$2b$10$dbhashedpassword',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      // when & then
      expect(() => User.reconstitute(props)).toThrow(AccountIdError);
    });

    it('reconstitute 시에도 Email VO 검증을 수행해야 한다', () => {
      // given - 무효한 email
      const props = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        accountId: 'user_789',
        email: 'invalid-email',
        name: 'DB사용자',
        passwordHash: '$2b$10$dbhashedpassword',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      // when & then
      expect(() => User.reconstitute(props)).toThrow('INVALID_EMAIL_FORMAT');
    });

    it('reconstitute 시에도 name 검증을 수행해야 한다', () => {
      // given - 빈 name
      const props = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        accountId: 'user_789',
        email: 'db@example.com',
        name: '',
        passwordHash: '$2b$10$dbhashedpassword',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };

      // when & then
      expect(() => User.reconstitute(props)).toThrow('NAME_REQUIRED');
    });
  });
});
