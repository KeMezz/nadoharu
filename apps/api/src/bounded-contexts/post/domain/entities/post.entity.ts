import { randomUUID } from 'crypto';
import {
  PostValidationError,
  PostValidationErrorCode,
} from '../errors/post-validation.error';

interface CreatePostProps {
  content: string;
  subcontent?: string | null;
  category?: string | null;
  imageUrls: string[];
  authorId: string;
}

interface ReconstitutePostProps extends CreatePostProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface UpdatePostProps {
  content: string;
  subcontent?: string | null;
  category?: string | null;
  imageUrls: string[];
}

const MAX_CONTENT_LENGTH = 150;
const MAX_SUBCONTENT_LENGTH = 150;
const MAX_IMAGE_COUNT = 4;

export class Post {
  private constructor(
    private readonly id: string,
    private readonly content: string,
    private readonly subcontent: string | null,
    private readonly category: string | null,
    private readonly imageUrls: string[],
    private readonly authorId: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly deletedAt: Date | null,
  ) {}

  static create(props: CreatePostProps): Post {
    const normalized = Post.normalizeAndValidate({
      content: props.content,
      subcontent: props.subcontent,
      category: props.category,
      imageUrls: props.imageUrls,
    });

    const now = new Date();

    return new Post(
      randomUUID(),
      normalized.content,
      normalized.subcontent,
      normalized.category,
      normalized.imageUrls,
      props.authorId,
      now,
      now,
      null,
    );
  }

  static reconstitute(props: ReconstitutePostProps): Post {
    const normalized = Post.normalizeAndValidate({
      content: props.content,
      subcontent: props.subcontent,
      category: props.category,
      imageUrls: props.imageUrls,
    });

    return new Post(
      props.id,
      normalized.content,
      normalized.subcontent,
      normalized.category,
      normalized.imageUrls,
      props.authorId,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
    );
  }

  update(props: UpdatePostProps): Post {
    const normalized = Post.normalizeAndValidate({
      content: props.content,
      subcontent: props.subcontent,
      category: props.category,
      imageUrls: props.imageUrls,
    });

    return new Post(
      this.id,
      normalized.content,
      normalized.subcontent,
      normalized.category,
      normalized.imageUrls,
      this.authorId,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }

  markDeleted(): Post {
    const now = new Date();
    return new Post(
      this.id,
      this.content,
      this.subcontent,
      this.category,
      this.imageUrls,
      this.authorId,
      this.createdAt,
      now,
      now,
    );
  }

  getId(): string {
    return this.id;
  }

  getContent(): string {
    return this.content;
  }

  getSubcontent(): string | null {
    return this.subcontent;
  }

  getCategory(): string | null {
    return this.category;
  }

  getImageUrls(): string[] {
    return [...this.imageUrls];
  }

  getAuthorId(): string {
    return this.authorId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  private static normalizeAndValidate(input: {
    content: string;
    subcontent?: string | null;
    category?: string | null;
    imageUrls: string[];
  }): {
    content: string;
    subcontent: string | null;
    category: string | null;
    imageUrls: string[];
  } {
    const content = input.content.trim();
    const subcontent = Post.normalizeOptionalString(input.subcontent);
    const category = Post.normalizeOptionalString(input.category);
    const imageUrls = [...input.imageUrls];

    if (content.length > MAX_CONTENT_LENGTH) {
      throw new PostValidationError(
        PostValidationErrorCode.POST_CONTENT_TOO_LONG,
        'content는 150자를 초과할 수 없습니다.',
      );
    }

    if (subcontent && subcontent.length > MAX_SUBCONTENT_LENGTH) {
      throw new PostValidationError(
        PostValidationErrorCode.POST_SUBCONTENT_TOO_LONG,
        'subcontent는 150자를 초과할 수 없습니다.',
      );
    }

    if (imageUrls.length > MAX_IMAGE_COUNT) {
      throw new PostValidationError(
        PostValidationErrorCode.POST_IMAGE_LIMIT_EXCEEDED,
        '이미지는 최대 4장까지 허용됩니다.',
      );
    }

    if (content.length === 0 && imageUrls.length === 0) {
      throw new PostValidationError(
        PostValidationErrorCode.POST_CONTENT_OR_IMAGE_REQUIRED,
        '게시물은 content 또는 imageUrls 중 하나 이상이 필요합니다.',
      );
    }

    return {
      content,
      subcontent,
      category,
      imageUrls,
    };
  }

  private static normalizeOptionalString(value?: string | null): string | null {
    if (value == null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
}
