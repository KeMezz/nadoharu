import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { User } from '../../domain/entities/user.entity';

// PrismaClient 모킹 (직접 import 대신)
const mockPrismaClient = {
  user: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: typeof mockPrismaClient;

  beforeEach(async () => {
    // 각 테스트 전에 mock 초기화
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: 'PrismaClient',
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prisma = mockPrismaClient;
  });

  describe('save', () => {
    it('새 사용자를 저장하고 User 엔티티를 반환해야 한다', async () => {
      // Given
      const user = User.create({
        accountId: 'testuser',
        email: 'test@example.com',
        name: '테스트 사용자',
        passwordHash: 'hashed_password',
      });

      const savedData = {
        id: user.getId(),
        accountId: user.getAccountId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName(),
        passwordHash: user.getPasswordHash(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      };

      jest.spyOn(prisma.user, 'upsert').mockResolvedValue(savedData);

      // When
      const result = await repository.save(user);

      // Then
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { id: user.getId() },
        create: {
          id: user.getId(),
          accountId: user.getAccountId().getValue(),
          email: user.getEmail().getValue(),
          name: user.getName(),
          passwordHash: user.getPasswordHash(),
          createdAt: user.getCreatedAt(),
          updatedAt: user.getUpdatedAt(),
        },
        update: {
          accountId: user.getAccountId().getValue(),
          email: user.getEmail().getValue(),
          name: user.getName(),
          passwordHash: user.getPasswordHash(),
          updatedAt: user.getUpdatedAt(),
        },
      });

      expect(result).toBeInstanceOf(User);
      expect(result.getId()).toBe(user.getId());
      expect(result.getAccountId().getValue()).toBe(
        user.getAccountId().getValue(),
      );
      expect(result.getEmail().getValue()).toBe(user.getEmail().getValue());
      expect(result.getName()).toBe(user.getName());
      expect(result.getPasswordHash()).toBe(user.getPasswordHash());
    });

    it('VO의 getValue() 메서드를 호출하여 값을 추출해야 한다', async () => {
      // Given
      const user = User.create({
        accountId: 'testuser',
        email: 'test@example.com',
        name: '테스트 사용자',
        passwordHash: 'hashed_password',
      });

      const accountIdSpy = jest.spyOn(user.getAccountId(), 'getValue');
      const emailSpy = jest.spyOn(user.getEmail(), 'getValue');

      const savedData = {
        id: user.getId(),
        accountId: user.getAccountId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName(),
        passwordHash: user.getPasswordHash(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      };

      jest.spyOn(prisma.user, 'upsert').mockResolvedValue(savedData);

      // When
      await repository.save(user);

      // Then
      expect(accountIdSpy).toHaveBeenCalled();
      expect(emailSpy).toHaveBeenCalled();
    });

    it('저장 후 User.reconstitute()로 엔티티를 재구성해야 한다', async () => {
      // Given
      const user = User.create({
        accountId: 'testuser',
        email: 'test@example.com',
        name: '테스트 사용자',
        passwordHash: 'hashed_password',
      });

      const savedData = {
        id: user.getId(),
        accountId: user.getAccountId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName(),
        passwordHash: user.getPasswordHash(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      };

      jest.spyOn(prisma.user, 'upsert').mockResolvedValue(savedData);
      const reconstituteSpy = jest.spyOn(User, 'reconstitute');

      // When
      await repository.save(user);

      // Then
      expect(reconstituteSpy).toHaveBeenCalledWith({
        id: savedData.id,
        accountId: savedData.accountId,
        email: savedData.email,
        name: savedData.name,
        passwordHash: savedData.passwordHash,
        createdAt: savedData.createdAt,
        updatedAt: savedData.updatedAt,
      });
    });
  });
});
