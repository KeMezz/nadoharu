import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Post')
export class PostType {
  @Field()
  id!: string;

  @Field()
  content!: string;

  @Field(() => String, { nullable: true })
  subcontent!: string | null;

  @Field(() => String, { nullable: true })
  category!: string | null;

  @Field(() => [String])
  imageUrls!: string[];

  @Field()
  authorId!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class PostEdge {
  @Field(() => PostType)
  node!: PostType;

  @Field()
  cursor!: string;
}

@ObjectType()
export class PostPageInfo {
  @Field()
  hasNextPage!: boolean;

  @Field(() => String, { nullable: true })
  endCursor!: string | null;
}

@ObjectType()
export class PostConnection {
  @Field(() => [PostEdge])
  edges!: PostEdge[];

  @Field(() => PostPageInfo)
  pageInfo!: PostPageInfo;
}

@InputType()
export class CreatePostInput {
  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => String, { nullable: true })
  subcontent?: string | null;

  @Field(() => String, { nullable: true })
  category?: string | null;

  @Field(() => [String], { nullable: true })
  imageUrls?: string[] | null;
}

@InputType()
export class UpdatePostInput {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  content?: string | null;

  @Field(() => String, { nullable: true })
  subcontent?: string | null;

  @Field(() => String, { nullable: true })
  category?: string | null;

  @Field(() => [String], { nullable: true })
  imageUrls?: string[] | null;
}

@InputType()
export class DeletePostInput {
  @Field()
  id!: string;
}

@InputType()
export class IssuePostImageUploadUrlInput {
  @Field()
  contentType!: string;

  @Field(() => Int)
  fileSize!: number;
}

@ObjectType()
export class PostImageUploadUrlPayload {
  @Field()
  uploadUrl!: string;

  @Field()
  imageUrl!: string;

  @Field()
  objectKey!: string;

  @Field(() => Int)
  expiresInSeconds!: number;
}
