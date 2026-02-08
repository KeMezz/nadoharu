import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('hash', () => {
    it('비밀번호를 해싱하여 원본과 다른 문자열을 반환해야 한다', async () => {
      const plainPassword = 'MyP@ssw0rd';

      const hashedPassword = await passwordService.hash(plainPassword);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
    });

    it('동일한 비밀번호를 두 번 해싱하면 서로 다른 해시를 생성해야 한다 (salt 때문에)', async () => {
      const plainPassword = 'MyP@ssw0rd';

      const hash1 = await passwordService.hash(plainPassword);
      const hash2 = await passwordService.hash(plainPassword);

      expect(hash1).not.toBe(hash2);
    });

    it('bcrypt 해시 형식($2b$ 접두사)을 반환해야 한다', async () => {
      const plainPassword = 'MyP@ssw0rd';

      const hashedPassword = await passwordService.hash(plainPassword);

      expect(hashedPassword).toMatch(/^\$2b\$/);
    });

    it('bcrypt salt rounds 10을 사용해야 한다', async () => {
      const plainPassword = 'MyP@ssw0rd';

      const hashedPassword = await passwordService.hash(plainPassword);

      // bcrypt 해시 형식: $2b$10$... (10은 salt rounds)
      expect(hashedPassword).toMatch(/^\$2b\$10\$/);
    });

    it('빈 문자열도 해싱할 수 있어야 한다', async () => {
      const hashedPassword = await passwordService.hash('');
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).toMatch(/^\$2b\$10\$/);
    });
  });

  describe('compare', () => {
    it('올바른 비밀번호를 비교하면 true를 반환해야 한다', async () => {
      const plainPassword = 'MyP@ssw0rd';
      const hashedPassword = await passwordService.hash(plainPassword);

      const result = await passwordService.compare(plainPassword, hashedPassword);

      expect(result).toBe(true);
    });

    it('잘못된 비밀번호를 비교하면 false를 반환해야 한다', async () => {
      const plainPassword = 'MyP@ssw0rd';
      const wrongPassword = 'WrongP@ssw0rd';
      const hashedPassword = await passwordService.hash(plainPassword);

      const result = await passwordService.compare(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });

    it('대소문자를 구분해야 한다', async () => {
      const plainPassword = 'MyP@ssw0rd';
      const hashedPassword = await passwordService.hash(plainPassword);

      const result = await passwordService.compare('myp@ssw0rd', hashedPassword);

      expect(result).toBe(false);
    });

    it('빈 문자열 비교 시 false를 반환해야 한다', async () => {
      const plainPassword = 'MyP@ssw0rd';
      const hashedPassword = await passwordService.hash(plainPassword);

      const result = await passwordService.compare('', hashedPassword);

      expect(result).toBe(false);
    });
  });
});
