import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/entities/user.entity';
import { PasswordService } from '../../domain/services/password.service';
import { UserRepository } from '../ports/user.repository.interface';
import { AuthenticateUserUseCase } from './authenticate-user.use-case';

describe('AuthenticateUserUseCase', () => {
  let useCase: AuthenticateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findByAccountId: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    useCase = new AuthenticateUserUseCase(
      userRepository,
      passwordService,
      jwtService,
    );
  });

  describe('execute', () => {
    const mockUser = User.reconstitute({
      id: '550e8400-e29b-41d4-a716-446655440000',
      accountId: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });

    it('올바른 accountId와 password로 JWT 토큰을 발급한다', async () => {
      // Given
      const accountId = 'testuser';
      const password = 'Password123!';
      const expectedToken = 'jwt.token.here';

      userRepository.findByAccountId.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue(expectedToken);

      // When
      const result = await useCase.execute({ accountId, password });

      // Then
      expect(result).toEqual({ accessToken: expectedToken });
      expect(userRepository.findByAccountId).toHaveBeenCalledWith(accountId);
      expect(passwordService.compare).toHaveBeenCalledWith(
        password,
        mockUser.getPasswordHash(),
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.getId(),
        accountId: mockUser.getAccountId().getValue(),
      });
    });

    it('존재하지 않는 accountId로 인증 시 INVALID_CREDENTIALS 에러를 발생시킨다', async () => {
      // Given
      const accountId = 'nonexistent';
      const password = 'Password123!';

      userRepository.findByAccountId.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute({ accountId, password })).rejects.toThrow(
        'INVALID_CREDENTIALS',
      );
      expect(userRepository.findByAccountId).toHaveBeenCalledWith(accountId);
      expect(passwordService.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('잘못된 비밀번호로 인증 시 INVALID_CREDENTIALS 에러를 발생시킨다', async () => {
      // Given
      const accountId = 'testuser';
      const password = 'WrongPassword';

      userRepository.findByAccountId.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(false);

      // When & Then
      await expect(useCase.execute({ accountId, password })).rejects.toThrow(
        'INVALID_CREDENTIALS',
      );
      expect(userRepository.findByAccountId).toHaveBeenCalledWith(accountId);
      expect(passwordService.compare).toHaveBeenCalledWith(
        password,
        mockUser.getPasswordHash(),
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('계정 존재 여부와 비밀번호 오류 시 동일한 에러 메시지를 반환한다', async () => {
      // Given
      const password = 'Password123!';

      // Case 1: 존재하지 않는 계정
      userRepository.findByAccountId.mockResolvedValue(null);
      let error1: Error | null = null;
      try {
        await useCase.execute({ accountId: 'nonexistent', password });
      } catch (e) {
        error1 = e as Error;
      }

      // Case 2: 잘못된 비밀번호
      userRepository.findByAccountId.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(false);
      let error2: Error | null = null;
      try {
        await useCase.execute({ accountId: 'testuser', password });
      } catch (e) {
        error2 = e as Error;
      }

      // Then: 에러 메시지가 동일해야 함 (계정 존재 여부 노출 방지)
      expect(error1).not.toBeNull();
      expect(error2).not.toBeNull();
      expect(error1!.message).toBe(error2!.message);
      expect(error1!.message).toBe('INVALID_CREDENTIALS');
    });
  });
});
