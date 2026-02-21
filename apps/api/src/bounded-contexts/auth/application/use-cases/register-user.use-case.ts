import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../ports/user.repository.interface';
import { PasswordService } from '../../domain/services/password.service';
import { User } from '../../domain/entities/user.entity';
import { Password } from '../../domain/value-objects/password.vo';
import { AccountId } from '../../domain/value-objects/account-id.vo';
import { Email } from '../../domain/value-objects/email.vo';
import {
  AccountIdAlreadyExistsError,
  EmailAlreadyExistsError,
} from '../../domain/errors/auth.error';

export interface RegisterUserInput {
  accountId: string;
  email: string;
  name: string;
  password: string;
}

/**
 * RegisterUserUseCase
 * 사용자 회원가입 UseCase
 *
 * 책임:
 * 1. 입력 데이터 검증 (VO를 통한 자동 검증)
 * 2. 중복 확인 (accountId, email)
 * 3. 비밀번호 해싱
 * 4. User 엔티티 생성 및 저장
 *
 * DDD 원칙:
 * - Application Layer UseCase
 * - Domain Layer만 의존 (PasswordService, User, VO)
 * - Repository는 인터페이스로 DI
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    // 1. VO 검증 (빠른 로컬 연산 우선)
    Password.create(input.password);
    AccountId.create(input.accountId);
    Email.create(input.email);
    // Name 검증은 User.create() 내부에서 수행

    // 2. 중복 확인 - accountId
    const existingUserByAccountId = await this.userRepository.findByAccountId(
      input.accountId,
    );
    if (existingUserByAccountId) {
      throw new AccountIdAlreadyExistsError();
    }

    // 3. 중복 확인 - email
    const existingUserByEmail = await this.userRepository.findByEmail(
      input.email,
    );
    if (existingUserByEmail) {
      throw new EmailAlreadyExistsError();
    }

    // 4. 비밀번호 해싱
    const passwordHash = await this.passwordService.hash(input.password);

    // 5. User 엔티티 생성 및 저장 (한 번만)
    const user = User.create({
      accountId: input.accountId,
      email: input.email,
      name: input.name,
      passwordHash,
    });

    return await this.userRepository.save(user);
  }
}
