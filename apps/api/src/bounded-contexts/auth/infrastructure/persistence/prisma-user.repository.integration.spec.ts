import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaUserRepository } from './prisma-user.repository';
import { User } from '../../domain/entities/user.entity';
import { PasswordService } from '../../domain/services/password.service';

describe('PrismaUserRepository (Integration)', () => {
  let repository: PrismaUserRepository;
  let prisma: PrismaClient;
  let passwordService: PasswordService;
  let pool: Pool;

  beforeAll(async () => {
    // Prisma 7: adapter를 통한 DB 연결
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
    passwordService = new PasswordService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: 'PrismaClient',
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
  });

  beforeEach(async () => {
    // 각 테스트 전 DB 클린업
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // 테스트 종료 후 DB 연결 종료
    await prisma.$disconnect();
    await pool.end();
  });

  describe('save() - 새 사용자 저장 성공', () => {
    it('User 엔티티를 DB에 저장할 수 있어야 함', async () => {
      // Given: 새 User 엔티티 생성
      const passwordHash = await passwordService.hash('password123');
      const user = User.create({
        accountId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
      });

      // When: save() 호출
      const savedUser = await repository.save(user);

      // Then: 저장된 User 반환
      expect(savedUser).toBeDefined();
      expect(savedUser.getId()).toBe(user.getId());

      // Then: DB에 저장 확인
      const record = await prisma.user.findUnique({
        where: { id: user.getId() },
      });
      expect(record).toBeDefined();
      expect(record?.accountId).toBe('testuser');
      expect(record?.email).toBe('test@example.com');
      expect(record?.name).toBe('Test User');
    });
  });

  describe('save() - 기존 사용자 업데이트 (upsert)', () => {
    it('동일 id로 두 번 save() 호출 시 업데이트되어야 함', async () => {
      // Given: 첫 번째 저장
      const passwordHash = await passwordService.hash('password123');
      const user = User.create({
        accountId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
      });
      await repository.save(user);

      // When: 같은 id로 다시 저장 (reconstitute로 새 인스턴스 생성)
      const updatedUser = User.reconstitute({
        id: user.getId(),
        accountId: 'updated_user',
        email: 'updated@example.com',
        name: 'Updated User',
        passwordHash,
        createdAt: user.getCreatedAt(),
        updatedAt: new Date(),
      });
      await repository.save(updatedUser);

      // Then: 업데이트된 데이터 확인
      const record = await prisma.user.findUnique({
        where: { id: user.getId() },
      });
      expect(record?.accountId).toBe('updated_user');
      expect(record?.email).toBe('updated@example.com');
      expect(record?.name).toBe('Updated User');

      // Then: 레코드가 1개만 존재 (생성이 아닌 업데이트)
      const count = await prisma.user.count();
      expect(count).toBe(1);
    });
  });

  describe('findByAccountId() - 소문자 비교로 조회 성공', () => {
    it('대소문자 구분 없이 조회할 수 있어야 함', async () => {
      // Given: accountId="testuser"로 저장
      const passwordHash = await passwordService.hash('password123');
      const user = User.create({
        accountId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
      });
      await repository.save(user);

      // When: 대문자로 조회
      const foundByUpper = await repository.findByAccountId('TESTUSER');
      const foundByMixed = await repository.findByAccountId('TestUser');
      const foundByLower = await repository.findByAccountId('testuser');

      // Then: 모두 조회 성공
      expect(foundByUpper).toBeDefined();
      expect(foundByUpper?.getAccountId().getValue()).toBe('testuser');

      expect(foundByMixed).toBeDefined();
      expect(foundByMixed?.getAccountId().getValue()).toBe('testuser');

      expect(foundByLower).toBeDefined();
      expect(foundByLower?.getAccountId().getValue()).toBe('testuser');
    });
  });

  describe('findByAccountId() - 존재하지 않으면 null 반환', () => {
    it('존재하지 않는 accountId 조회 시 null을 반환해야 함', async () => {
      // When: 존재하지 않는 accountId로 조회
      const result = await repository.findByAccountId('nonexistent');

      // Then: null 반환
      expect(result).toBeNull();
    });
  });

  describe('findByEmail() - 소문자 비교로 조회 성공', () => {
    it('대소문자 구분 없이 조회할 수 있어야 함', async () => {
      // Given: email="user@example.com"로 저장
      const passwordHash = await passwordService.hash('password123');
      const user = User.create({
        accountId: 'testuser',
        email: 'user@example.com',
        name: 'Test User',
        passwordHash,
      });
      await repository.save(user);

      // When: 대소문자 혼합으로 조회
      const foundByUpper = await repository.findByEmail('USER@EXAMPLE.COM');
      const foundByMixed = await repository.findByEmail('User@Example.COM');
      const foundByLower = await repository.findByEmail('user@example.com');

      // Then: 모두 조회 성공
      expect(foundByUpper).toBeDefined();
      expect(foundByUpper?.getEmail().getValue()).toBe('user@example.com');

      expect(foundByMixed).toBeDefined();
      expect(foundByMixed?.getEmail().getValue()).toBe('user@example.com');

      expect(foundByLower).toBeDefined();
      expect(foundByLower?.getEmail().getValue()).toBe('user@example.com');
    });
  });

  describe('findByEmail() - 존재하지 않으면 null 반환', () => {
    it('존재하지 않는 email 조회 시 null을 반환해야 함', async () => {
      // When: 존재하지 않는 email로 조회
      const result = await repository.findByEmail('nonexistent@example.com');

      // Then: null 반환
      expect(result).toBeNull();
    });
  });

  describe('findById() - UUID로 조회 성공', () => {
    it('UUID로 User를 조회할 수 있어야 함', async () => {
      // Given: User 저장
      const passwordHash = await passwordService.hash('password123');
      const user = User.create({
        accountId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
      });
      await repository.save(user);

      // When: id로 조회
      const found = await repository.findById(user.getId());

      // Then: 조회 성공
      expect(found).toBeDefined();
      expect(found?.getId()).toBe(user.getId());
      expect(found?.getAccountId().getValue()).toBe('testuser');
      expect(found?.getEmail().getValue()).toBe('test@example.com');
      expect(found?.getName()).toBe('Test User');
    });
  });

  describe('findById() - 존재하지 않으면 null 반환', () => {
    it('존재하지 않는 id 조회 시 null을 반환해야 함', async () => {
      // When: 존재하지 않는 UUID로 조회
      const result = await repository.findById(
        '00000000-0000-0000-0000-000000000000',
      );

      // Then: null 반환
      expect(result).toBeNull();
    });
  });

  describe('통합 시나리오: save() 후 모든 조회 메서드로 접근 가능', () => {
    it('저장 후 id, accountId, email 모두로 조회 가능해야 함', async () => {
      // Given: User 저장
      const passwordHash = await passwordService.hash('password123');
      const user = User.create({
        accountId: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash,
      });
      await repository.save(user);

      // When & Then: id로 조회
      const foundById = await repository.findById(user.getId());
      expect(foundById).toBeDefined();
      expect(foundById?.getId()).toBe(user.getId());

      // When & Then: accountId로 조회
      const foundByAccountId = await repository.findByAccountId('testuser');
      expect(foundByAccountId).toBeDefined();
      expect(foundByAccountId?.getId()).toBe(user.getId());

      // When & Then: email로 조회
      const foundByEmail = await repository.findByEmail('test@example.com');
      expect(foundByEmail).toBeDefined();
      expect(foundByEmail?.getId()).toBe(user.getId());

      // Then: 모두 동일한 User
      expect(foundById?.getId()).toBe(foundByAccountId?.getId());
      expect(foundById?.getId()).toBe(foundByEmail?.getId());
    });
  });
});
