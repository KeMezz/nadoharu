import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../application/ports/user.repository.interface';

/**
 * PrismaUserRepository
 * UserRepository의 Prisma 구현체
 *
 * Infrastructure Layer에서 Repository 인터페이스를 구현하여
 * Prisma를 사용한 영속성을 제공합니다.
 */
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    @Inject('PrismaClient') private readonly prisma: PrismaClient,
  ) {}

  /**
   * User 엔티티 저장 (생성 또는 수정)
   * @param user 저장할 User 엔티티
   * @returns 저장된 User 엔티티
   */
  async save(user: User): Promise<User> {
    // 1. User 엔티티 → Prisma 모델 매핑
    const data = {
      id: user.getId(),
      accountId: user.getAccountId().getValue(),
      email: user.getEmail().getValue(),
      name: user.getName(),
      passwordHash: user.getPasswordHash(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    // 2. Prisma upsert 실행
    const savedUser = await this.prisma.user.upsert({
      where: { id: user.getId() },
      create: data,
      update: {
        accountId: data.accountId,
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        updatedAt: data.updatedAt,
      },
    });

    // 3. Prisma 모델 → User 엔티티 재구성
    return User.reconstitute({
      id: savedUser.id,
      accountId: savedUser.accountId,
      email: savedUser.email,
      name: savedUser.name,
      passwordHash: savedUser.passwordHash,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    });
  }

  /**
   * accountId로 User 조회
   * accountId는 소문자로 정규화하여 비교
   * @param accountId 조회할 accountId
   * @returns User 엔티티 또는 null (미존재)
   */
  async findByAccountId(accountId: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: {
        accountId: {
          equals: accountId.toLowerCase(),
          mode: 'insensitive',
        },
      },
    });

    if (!record) {
      return null;
    }

    return User.reconstitute({
      id: record.id,
      accountId: record.accountId,
      email: record.email,
      name: record.name,
      passwordHash: record.passwordHash,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * email로 User 조회
   * email은 소문자로 정규화하여 비교
   * @param email 조회할 email
   * @returns User 엔티티 또는 null (미존재)
   */
  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: 'insensitive',
        },
      },
    });

    if (!record) {
      return null;
    }

    return User.reconstitute({
      id: record.id,
      accountId: record.accountId,
      email: record.email,
      name: record.name,
      passwordHash: record.passwordHash,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  /**
   * id로 User 조회
   * @param id 조회할 User id (UUID)
   * @returns User 엔티티 또는 null (미존재)
   */
  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return User.reconstitute({
      id: record.id,
      accountId: record.accountId,
      email: record.email,
      name: record.name,
      passwordHash: record.passwordHash,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
