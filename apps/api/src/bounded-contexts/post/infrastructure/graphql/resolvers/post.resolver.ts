import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { CreatePostUseCase } from '../../../application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from '../../../application/use-cases/update-post.use-case';
import { DeletePostUseCase } from '../../../application/use-cases/delete-post.use-case';
import { GetPostUseCase } from '../../../application/use-cases/get-post.use-case';
import { ListPostsUseCase } from '../../../application/use-cases/list-posts.use-case';
import { IssuePostImageUploadUrlUseCase } from '../../../application/use-cases/issue-post-image-upload-url.use-case';
import {
  CreatePostInput,
  DeletePostInput,
  IssuePostImageUploadUrlInput,
  PostConnection,
  PostImageUploadUrlPayload,
  PostType,
  UpdatePostInput,
} from '../types/post.types';
import { toPostGraphQLError } from '../post-error.mapper';
import { Post } from '../../../domain/entities/post.entity';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../auth/infrastructure/guards/current-user.decorator';
import { AuthenticatedUser } from '../../../../auth/infrastructure/jwt/jwt.strategy';

@Resolver()
export class PostResolver {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly getPostUseCase: GetPostUseCase,
    private readonly listPostsUseCase: ListPostsUseCase,
    private readonly issuePostImageUploadUrlUseCase: IssuePostImageUploadUrlUseCase,
  ) {}

  @Mutation(() => PostType)
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
  ): Promise<PostType> {
    try {
      const user = assertAuthenticatedUser(currentUser);
      const post = await this.createPostUseCase.execute({
        authorId: user.id,
        content: input.content,
        subcontent: input.subcontent,
        category: input.category,
        imageUrls: input.imageUrls,
      });

      return this.toPostType(post);
    } catch (error) {
      throw toPostGraphQLError(error);
    }
  }

  @Mutation(() => PostType)
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Args('input') input: UpdatePostInput,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
  ): Promise<PostType> {
    try {
      const user = assertAuthenticatedUser(currentUser);
      const post = await this.updatePostUseCase.execute({
        postId: input.id,
        userId: user.id,
        content: input.content,
        subcontent: input.subcontent,
        category: input.category,
        imageUrls: input.imageUrls,
      });

      return this.toPostType(post);
    } catch (error) {
      throw toPostGraphQLError(error);
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @Args('input') input: DeletePostInput,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
  ): Promise<boolean> {
    try {
      const user = assertAuthenticatedUser(currentUser);
      return await this.deletePostUseCase.execute({
        postId: input.id,
        userId: user.id,
      });
    } catch (error) {
      throw toPostGraphQLError(error);
    }
  }

  @Query(() => PostType, { nullable: true })
  async post(@Args('id') id: string): Promise<PostType | null> {
    try {
      const post = await this.getPostUseCase.execute({ postId: id });
      return post ? this.toPostType(post) : null;
    } catch (error) {
      throw toPostGraphQLError(error);
    }
  }

  @Query(() => PostConnection)
  @UseGuards(JwtAuthGuard)
  async posts(
    @Args('first', { type: () => Int }) first: number,
    @Args('after', { type: () => String, nullable: true })
    after?: string | null,
    @Args('before', { type: () => String, nullable: true })
    before?: string | null,
    @Args('last', { type: () => Int, nullable: true }) last?: number | null,
  ): Promise<PostConnection> {
    try {
      const result = await this.listPostsUseCase.execute({
        first,
        after,
        before,
        last,
      });

      return {
        edges: result.edges.map((edge) => ({
          node: this.toPostType(edge.node),
          cursor: edge.cursor,
        })),
        pageInfo: {
          hasNextPage: result.pageInfo.hasNextPage,
          endCursor: result.pageInfo.endCursor,
        },
      };
    } catch (error) {
      throw toPostGraphQLError(error);
    }
  }

  @Mutation(() => PostImageUploadUrlPayload)
  @UseGuards(JwtAuthGuard)
  async issuePostImageUploadUrl(
    @Args('input') input: IssuePostImageUploadUrlInput,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
  ): Promise<PostImageUploadUrlPayload> {
    try {
      const user = assertAuthenticatedUser(currentUser);
      return await this.issuePostImageUploadUrlUseCase.execute({
        userId: user.id,
        contentType: input.contentType,
        fileSize: input.fileSize,
      });
    } catch (error) {
      throw toPostGraphQLError(error);
    }
  }

  private toPostType(post: Post): PostType {
    return {
      id: post.getId(),
      content: post.getContent(),
      subcontent: post.getSubcontent(),
      category: post.getCategory(),
      imageUrls: post.getImageUrls(),
      authorId: post.getAuthorId(),
      createdAt: post.getCreatedAt(),
      updatedAt: post.getUpdatedAt(),
    };
  }
}

function assertAuthenticatedUser(
  currentUser: AuthenticatedUser | undefined,
): AuthenticatedUser {
  if (!currentUser) {
    throw new GraphQLError('UNAUTHORIZED', {
      extensions: {
        code: 'UNAUTHORIZED',
      },
    });
  }

  return currentUser;
}
