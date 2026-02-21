import { UnauthorizedError } from '../../domain/errors/auth.error';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../ports/user.repository.interface';
import { GetCurrentUserUseCase } from './get-current-user.use-case';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = User.reconstitute({
    id: '550e8400-e29b-41d4-a716-446655440000',
    accountId: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2b$10$hashedpassword',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  });

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findByAccountId: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new GetCurrentUserUseCase(userRepository);
  });

  it('사용자 ID로 현재 사용자 정보를 조회한다', async () => {
    userRepository.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute({ userId: mockUser.getId() });

    expect(result).toBe(mockUser);
    expect(userRepository.findById).toHaveBeenCalledWith(mockUser.getId());
  });

  it('사용자가 존재하지 않으면 UNAUTHORIZED 에러를 던진다', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: '00000000-0000-0000-0000-000000000000' }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
