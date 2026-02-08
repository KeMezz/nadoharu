import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../../domain/services/password.service';
import { UserRepository } from '../ports/user.repository.interface';
import { InvalidCredentialsError } from '../../domain/errors/auth.error';

interface AuthenticateUserInput {
  accountId: string;
  password: string;
}

interface AuthenticateUserOutput {
  accessToken: string;
}

/**
 * AuthenticateUserUseCase
 * 사용자 인증 및 JWT 토큰 발급
 *
 * 비즈니스 규칙:
 * - accountId로 사용자 조회
 * - 비밀번호 검증 (bcrypt)
 * - JWT 토큰 발급 (payload: sub, accountId)
 * - 인증 실패 시 동일한 에러 메시지 반환 (계정 존재 여부 노출 방지)
 */
@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: AuthenticateUserInput,
  ): Promise<AuthenticateUserOutput> {
    const { accountId, password } = input;

    // 1. accountId로 사용자 조회
    const user = await this.userRepository.findByAccountId(accountId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 2. 비밀번호 검증
    const isPasswordValid = await this.passwordService.compare(
      password,
      user.getPasswordHash(),
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 3. JWT 토큰 발급
    const payload = {
      sub: user.getId(),
      accountId: user.getAccountId().getValue(),
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
