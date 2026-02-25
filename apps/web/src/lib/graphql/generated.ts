export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  user: User;
};

export type CreatePostInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  subcontent?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserInput = {
  accountId: Scalars['String']['input'];
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type DeletePostInput = {
  id: Scalars['String']['input'];
};

export type IssuePostImageUploadUrlInput = {
  contentType: Scalars['String']['input'];
  fileSize: Scalars['Int']['input'];
};

export type LoginInput = {
  accountId: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost: Post;
  createUser: User;
  deletePost: Scalars['Boolean']['output'];
  issuePostImageUploadUrl: PostImageUploadUrlPayload;
  login: AuthPayload;
  updatePost: Post;
};


export type MutationCreatePostArgs = {
  input: CreatePostInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeletePostArgs = {
  input: DeletePostInput;
};


export type MutationIssuePostImageUploadUrlArgs = {
  input: IssuePostImageUploadUrlInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationUpdatePostArgs = {
  input: UpdatePostInput;
};

export type Post = {
  __typename?: 'Post';
  authorId: Scalars['String']['output'];
  category?: Maybe<Scalars['String']['output']>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  imageUrls: Array<Scalars['String']['output']>;
  subcontent?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PostConnection = {
  __typename?: 'PostConnection';
  edges: Array<PostEdge>;
  pageInfo: PostPageInfo;
};

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String']['output'];
  node: Post;
};

export type PostImageUploadUrlPayload = {
  __typename?: 'PostImageUploadUrlPayload';
  expiresInSeconds: Scalars['Int']['output'];
  imageUrl: Scalars['String']['output'];
  objectKey: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export type PostPageInfo = {
  __typename?: 'PostPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  me: User;
  post?: Maybe<Post>;
  posts: PostConnection;
};


export type QueryPostArgs = {
  id: Scalars['String']['input'];
};


export type QueryPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first: Scalars['Int']['input'];
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdatePostInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  subcontent?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  accountId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};
