import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType('User')
export class UserType {
  @Field()
  id!: string;

  @Field()
  accountId!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  accountId!: string;

  @Field()
  password!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;
}

@InputType()
export class LoginInput {
  @Field()
  accountId!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class AuthPayload {
  @Field(() => UserType)
  user!: UserType;
}
