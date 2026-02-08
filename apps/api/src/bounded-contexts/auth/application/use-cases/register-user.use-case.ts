import { UserRepository } from '../ports/user.repository.interface';
import { PasswordService } from '../../domain/services/password.service';
import { User } from '../../domain/entities/user.entity';
import { Password } from '../../domain/value-objects/password.vo';

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
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    // 1. 중복 확인 - accountId
    const existingUserByAccountId = await this.userRepository.findByAccountId(
      input.accountId,
    );
    if (existingUserByAccountId) {
      throw new Error('ACCOUNT_ID_ALREADY_EXISTS');
    }

    // 2. 중복 확인 - email
    const existingUserByEmail = await this.userRepository.findByEmail(
      input.email,
    );
    if (existingUserByEmail) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // 3. VO 검증 (Password, AccountId, Email, Name)
    Password.create(input.password);

    // 4. User 엔티티 생성 (AccountId, Email, Name 검증 포함)
    // 임시 passwordHash로 VO 검증 수행
    const userWithoutHash = User.create({
      accountId: input.accountId,
      email: input.email,
      name: input.name,
      passwordHash: '', // 임시값, 아직 해싱하지 않음
    });

    // 5. 비밀번호 해싱 (모든 VO 검증 통과 후)
    const passwordHash = await this.passwordService.hash(input.password);

    // 6. 최종 User 엔티티 생성 (실제 passwordHash 포함)
    const user = User.create({
      accountId: input.accountId,
      email: input.email,
      name: input.name,
      passwordHash,
    });

    // 7. User 저장
    return await this.userRepository.save(user);
  }
}
