import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { CreatePostUseCase } from '../application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from '../application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '../application/use-cases/delete-post.use-case';
import { GetPostUseCase } from '../application/use-cases/get-post.use-case';
import { ListPostsUseCase } from '../application/use-cases/list-posts.use-case';
import { IssuePostImageUploadUrlUseCase } from '../application/use-cases/issue-post-image-upload-url.use-case';
import { POST_REPOSITORY } from '../application/ports/post.repository.interface';
import { POST_IMAGE_UPLOAD_SERVICE } from '../application/ports/post-image-upload.service.interface';
import { PostResolver } from './graphql/resolvers/post.resolver';
import { PrismaPostRepository } from './persistence/prisma-post.repository';
import { R2PostImageUploadService } from './storage/r2-post-image-upload.service';

@Module({
  imports: [AuthModule],
  providers: [
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    GetPostUseCase,
    ListPostsUseCase,
    IssuePostImageUploadUrlUseCase,
    PostResolver,
    PrismaPostRepository,
    {
      provide: POST_REPOSITORY,
      useExisting: PrismaPostRepository,
    },
    R2PostImageUploadService,
    {
      provide: POST_IMAGE_UPLOAD_SERVICE,
      useExisting: R2PostImageUploadService,
    },
  ],
})
export class PostModule {}
