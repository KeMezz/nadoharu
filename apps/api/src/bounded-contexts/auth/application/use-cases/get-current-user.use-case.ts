import { Inject, Injectable } from '@nestjs/common';
import { UnauthorizedError } from '../../domain/errors/auth.error';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../ports/user.repository.interface';

interface GetCurrentUserInput {
  userId: string;
}

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: GetCurrentUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UnauthorizedError();
    }

    return user;
  }
}
