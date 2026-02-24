import { Inject, Injectable } from '@nestjs/common';
import { PrismaClient } from '.prisma/client';
import {
  FindTimelineParams,
  FindTimelineResult,
  PostRepository,
} from '../../application/ports/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';

@Injectable()
export class PrismaPostRepository implements PostRepository {
  constructor(@Inject('PrismaClient') private readonly prisma: PrismaClient) {}

  async save(post: Post): Promise<Post> {
    const record = await this.prisma.post.upsert({
      where: { id: post.getId() },
      create: {
        id: post.getId(),
        content: post.getContent(),
        subcontent: post.getSubcontent(),
        category: post.getCategory(),
        imageUrls: post.getImageUrls(),
        authorId: post.getAuthorId(),
        createdAt: post.getCreatedAt(),
        updatedAt: post.getUpdatedAt(),
        deletedAt: post.getDeletedAt(),
      },
      update: {
        content: post.getContent(),
        subcontent: post.getSubcontent(),
        category: post.getCategory(),
        imageUrls: post.getImageUrls(),
        updatedAt: post.getUpdatedAt(),
        deletedAt: post.getDeletedAt(),
      },
    });

    return toDomain(record);
  }

  async findById(id: string): Promise<Post | null> {
    const record = await this.prisma.post.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!record) {
      return null;
    }

    return toDomain(record);
  }

  async findTimeline(params: FindTimelineParams): Promise<FindTimelineResult> {
    const records = await this.prisma.post.findMany({
      where: {
        deletedAt: null,
        ...(params.after
          ? {
              OR: [
                {
                  createdAt: {
                    lt: params.after.createdAt,
                  },
                },
                {
                  createdAt: params.after.createdAt,
                  id: {
                    lt: params.after.id,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: params.first + 1,
    });

    const hasNextPage = records.length > params.first;
    const sliced = hasNextPage ? records.slice(0, params.first) : records;

    return {
      posts: sliced.map(toDomain),
      hasNextPage,
    };
  }
}

function toDomain(record: {
  id: string;
  content: string;
  subcontent: string | null;
  category: string | null;
  imageUrls: string[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): Post {
  return Post.reconstitute({
    id: record.id,
    content: record.content,
    subcontent: record.subcontent,
    category: record.category,
    imageUrls: record.imageUrls,
    authorId: record.authorId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt,
  });
}
