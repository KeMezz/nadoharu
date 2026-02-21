import { randomUUID } from 'crypto';
import { AccountId } from '../value-objects/account-id.vo';
import { Email } from '../value-objects/email.vo';
import { NameError, NameErrorCode } from '../errors/name.error';

interface CreateUserProps {
  accountId: string;
  email: string;
  name: string;
  passwordHash: string;
}

interface ReconstituteUserProps extends CreateUserProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Entity
 * 사용자 도메인 엔티티
 *
 * 비즈니스 규칙:
 * - name: 1자 이상 50자 이하
 * - accountId, email은 각 VO의 검증 규칙을 따름
 */
export class User {
  private constructor(
    private readonly id: string,
    private readonly accountId: AccountId,
    private readonly email: Email,
    private readonly name: string,
    private readonly passwordHash: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  /**
   * 새로운 User 생성
   * @param props User 생성 속성
   * @throws {AccountIdError} 유효하지 않은 accountId
   * @throws {EmailError} 유효하지 않은 email
   * @throws {NameError} 유효하지 않은 name
   */
  static create(props: CreateUserProps): User {
    // 1. VO 생성 (자동 검증)
    const accountId = AccountId.create(props.accountId);
    const email = Email.create(props.email);

    // 2. name 검증
    const trimmedName = User.validateName(props.name);

    // 3. 자동 생성 필드
    const id = randomUUID();
    const now = new Date();

    // 4. User 인스턴스 반환
    return new User(
      id,
      accountId,
      email,
      trimmedName,
      props.passwordHash,
      now,
      now,
    );
  }

  /**
   * DB 데이터로 User 재구성
   * @param props User 재구성 속성
   * @throws {AccountIdError} 유효하지 않은 accountId
   * @throws {EmailError} 유효하지 않은 email
   * @throws {NameError} 유효하지 않은 name
   */
  static reconstitute(props: ReconstituteUserProps): User {
    // VO 생성 (자동 검증)
    const accountId = AccountId.create(props.accountId);
    const email = Email.create(props.email);

    // name 검증
    const trimmedName = User.validateName(props.name);

    return new User(
      props.id,
      accountId,
      email,
      trimmedName,
      props.passwordHash,
      props.createdAt,
      props.updatedAt,
    );
  }

  static validateName(name: string): string {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new NameError(
        NameErrorCode.NAME_REQUIRED,
        '이름은 필수 입력 값입니다.',
      );
    }
    if (trimmedName.length > 50) {
      throw new NameError(
        NameErrorCode.NAME_TOO_LONG,
        '이름은 50자 이하여야 합니다.',
      );
    }

    return trimmedName;
  }

  // Getter 메서드들
  getId(): string {
    return this.id;
  }

  getAccountId(): AccountId {
    return this.accountId;
  }

  getEmail(): Email {
    return this.email;
  }

  getName(): string {
    return this.name;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
