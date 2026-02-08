import { User } from '../../domain/entities/user.entity';

/**
 * UserRepository
 * User 엔티티의 저장소 인터페이스
 *
 * DDD 원칙:
 * - Application Layer에서 정의 (Domain에만 의존)
 * - Infrastructure Layer에서 구현
 * - Repository 패턴: 도메인 객체의 영속성을 추상화
 */
export interface UserRepository {
  /**
   * User 엔티티 저장 (생성 또는 수정)
   * @param user 저장할 User 엔티티
   * @returns 저장된 User 엔티티
   */
  save(user: User): Promise<User>;

  /**
   * accountId로 User 조회
   * accountId는 소문자로 정규화하여 비교
   * @param accountId 조회할 accountId
   * @returns User 엔티티 또는 null (미존재)
   */
  findByAccountId(accountId: string): Promise<User | null>;

  /**
   * email로 User 조회
   * email은 소문자로 정규화하여 비교
   * @param email 조회할 email
   * @returns User 엔티티 또는 null (미존재)
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * id로 User 조회
   * @param id 조회할 User id (UUID)
   * @returns User 엔티티 또는 null (미존재)
   */
  findById(id: string): Promise<User | null>;
}
