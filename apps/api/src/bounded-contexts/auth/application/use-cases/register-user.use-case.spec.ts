import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository } from '../ports/user.repository.interface';
import { PasswordService } from '../../domain/services/password.service';
import { User } from '../../domain/entities/user.entity';
import { AccountIdError } from '../../domain/errors/account-id.error';
import {
  AccountIdAlreadyExistsError,
  EmailAlreadyExistsError,
} from '../../domain/errors/auth.error';
import { EmailErrorCode } from '../../domain/errors/email.error';
import { NameErrorCode } from '../../domain/errors/name.error';
import { PasswordErrorCode } from '../../domain/errors/password.error';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;

  beforeEach(() => {
    // UserRepository Mock 생성
    mockUserRepository = {
      save: jest.fn(),
      findByAccountId: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    // PasswordService Mock 생성
    mockPasswordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as jest.Mocked<PasswordService>;

    useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordService);
  });

  describe('execute - 성공 시나리오', () => {
    it('유효한 정보로 회원가입에 성공해야 한다', async () => {
      // given
      const input = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '홍길동',
        password: 'MyP@ssw0rd123',
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hash.mockResolvedValue('$2b$10$hashedpassword');

      const savedUser = User.create({
        accountId: input.accountId,
        email: input.email,
        name: input.name,
        passwordHash: '$2b$10$hashedpassword',
      });
      mockUserRepository.save.mockResolvedValue(savedUser);

      // when
      const result = await useCase.execute(input);

      // then
      expect(result).toBeDefined();
      expect(result.getId()).toBeTruthy();
      expect(result.getAccountId().getValue()).toBe(input.accountId);
      expect(result.getEmail().getValue()).toBe(input.email);
      expect(result.getName()).toBe(input.name);
      expect(result.getPasswordHash()).toBe('$2b$10$hashedpassword');

      // 중복 검사 호출 확인
      expect(mockUserRepository.findByAccountId).toHaveBeenCalledWith(
        input.accountId,
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);

      // 비밀번호 해싱 호출 확인
      expect(mockPasswordService.hash).toHaveBeenCalledWith(input.password);

      // 저장 호출 확인
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          getAccountId: expect.any(Function),
          getEmail: expect.any(Function),
          getName: expect.any(Function),
          getPasswordHash: expect.any(Function),
        }),
      );
    });

    it('email은 정규화된 값으로 중복 확인하고 저장해야 한다', async () => {
      // given
      const input = {
        accountId: 'user_123',
        email: '  Test@Example.com ',
        name: '홍길동',
        password: 'MyP@ssw0rd123',
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hash.mockResolvedValue('$2b$10$hashedpassword');

      const savedUser = User.create({
        accountId: input.accountId,
        email: 'test@example.com',
        name: input.name,
        passwordHash: '$2b$10$hashedpassword',
      });
      mockUserRepository.save.mockResolvedValue(savedUser);

      // when
      const result = await useCase.execute(input);

      // then
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(result.getEmail().getValue()).toBe('test@example.com');
    });
  });

  describe('execute - 중복 검사 실패', () => {
    it('중복된 accountId가 존재하면 ACCOUNT_ID_ALREADY_EXISTS 에러를 던져야 한다', async () => {
      // given
      const input = {
        accountId: 'existing_user',
        email: 'new@example.com',
        name: '신규사용자',
        password: 'MyP@ssw0rd123',
      };

      const existingUser = User.create({
        accountId: 'existing_user',
        email: 'existing@example.com',
        name: '기존사용자',
        passwordHash: '$2b$10$existinghash',
      });

      mockUserRepository.findByAccountId.mockResolvedValue(existingUser);

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        AccountIdAlreadyExistsError,
      );

      // 중복 확인 후 더 이상 진행하지 않음
      expect(mockUserRepository.findByAccountId).toHaveBeenCalledWith(
        input.accountId,
      );
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockPasswordService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('중복된 email이 존재하면 EMAIL_ALREADY_EXISTS 에러를 던져야 한다', async () => {
      // given
      const input = {
        accountId: 'new_user',
        email: 'existing@example.com',
        name: '신규사용자',
        password: 'MyP@ssw0rd123',
      };

      const existingUser = User.create({
        accountId: 'existing_user',
        email: 'existing@example.com',
        name: '기존사용자',
        passwordHash: '$2b$10$existinghash',
      });

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        EmailAlreadyExistsError,
      );

      // accountId 중복 확인 후 email 중복 확인까지 진행
      expect(mockUserRepository.findByAccountId).toHaveBeenCalledWith(
        input.accountId,
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(input.email);

      // 중복 확인 후 더 이상 진행하지 않음
      expect(mockPasswordService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('execute - VO 정책 위반', () => {
    it('유효하지 않은 accountId이면 AccountIdError를 던져야 한다', async () => {
      // given - accountId가 너무 짧음
      const input = {
        accountId: 'ab', // 3자 미만
        email: 'test@example.com',
        name: '홍길동',
        password: 'MyP@ssw0rd123',
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(AccountIdError);

      // VO 검증 실패 시 중복 확인은 수행하지 않음
      expect(mockUserRepository.findByAccountId).not.toHaveBeenCalled();
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockPasswordService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('유효하지 않은 email이면 INVALID_EMAIL_FORMAT 에러를 던져야 한다', async () => {
      // given - email 형식이 잘못됨
      const input = {
        accountId: 'user_123',
        email: 'invalid-email', // @ 없음
        name: '홍길동',
        password: 'MyP@ssw0rd123',
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        expect.objectContaining({ code: EmailErrorCode.INVALID_EMAIL_FORMAT }),
      );

      // VO 검증 실패 시 중복 확인은 수행하지 않음
      expect(mockUserRepository.findByAccountId).not.toHaveBeenCalled();
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockPasswordService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('유효하지 않은 password이면 PASSWORD_TOO_SHORT 에러를 던져야 한다', async () => {
      // given - 비밀번호가 너무 짧음
      const input = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '홍길동',
        password: 'short1!', // 10자 미만
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        expect.objectContaining({ code: PasswordErrorCode.PASSWORD_TOO_SHORT }),
      );

      // VO 검증 실패 시 중복 확인은 수행하지 않음
      expect(mockUserRepository.findByAccountId).not.toHaveBeenCalled();
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockPasswordService.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('비밀번호에 소문자가 없으면 PASSWORD_MISSING_LOWERCASE 에러를 던져야 한다', async () => {
      // given
      const input = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '홍길동',
        password: 'MYP@SSW0RD123', // 소문자 없음
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        expect.objectContaining({
          code: PasswordErrorCode.PASSWORD_MISSING_LOWERCASE,
        }),
      );
    });

    it('비밀번호에 숫자가 없으면 PASSWORD_MISSING_NUMBER 에러를 던져야 한다', async () => {
      // given
      const input = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '홍길동',
        password: 'MyP@sswOrd!', // 숫자 없음
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        expect.objectContaining({
          code: PasswordErrorCode.PASSWORD_MISSING_NUMBER,
        }),
      );
    });

    it('비밀번호에 특수문자가 없으면 PASSWORD_MISSING_SPECIAL_CHAR 에러를 던져야 한다', async () => {
      // given
      const input = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '홍길동',
        password: 'MyPassword123', // 특수문자 없음
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        expect.objectContaining({
          code: PasswordErrorCode.PASSWORD_MISSING_SPECIAL_CHAR,
        }),
      );
    });

    it('name이 빈 문자열이면 NAME_REQUIRED 에러를 던져야 한다', async () => {
      // given
      const input = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: '',
        password: 'MyP@ssw0rd123',
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hash.mockResolvedValue('$2b$10$hashedpassword');

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        expect.objectContaining({ code: NameErrorCode.NAME_REQUIRED }),
      );
    });

    it('name이 51자 이상이면 NAME_TOO_LONG 에러를 던져야 한다', async () => {
      // given
      const input = {
        accountId: 'user_123',
        email: 'test@example.com',
        name: 'a'.repeat(51), // 51자
        password: 'MyP@ssw0rd123',
      };

      mockUserRepository.findByAccountId.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hash.mockResolvedValue('$2b$10$hashedpassword');

      // when & then
      await expect(useCase.execute(input)).rejects.toThrow(
        expect.objectContaining({ code: NameErrorCode.NAME_TOO_LONG }),
      );
    });
  });
});
