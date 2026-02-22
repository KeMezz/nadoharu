export interface User {
  id: string;
  accountId: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthPayload {
  user: User;
}

export interface LoginInput {
  accountId: string;
  password: string;
}

export interface CreateUserInput {
  accountId: string;
  password: string;
  email: string;
  name: string;
}

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}
