import * as bcrypt from 'bcrypt';

export class PasswordService {
  private static readonly SALT_ROUNDS = 10;

  /**
   * 비밀번호를 bcrypt로 해싱합니다.
   * @param plainPassword 원본 비밀번호
   * @returns 해싱된 비밀번호
   */
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, PasswordService.SALT_ROUNDS);
  }

  /**
   * 원본 비밀번호와 해시된 비밀번호를 비교합니다.
   * @param plainPassword 원본 비밀번호
   * @param hashedPassword 해시된 비밀번호
   * @returns 일치 여부
   */
  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
