export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        accountId
        email
        name
      }
    }
  }
`;

export const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      accountId
      email
      name
      createdAt
    }
  }
`;

export const ME_QUERY = `
  query Me {
    me {
      id
      accountId
      email
      name
    }
  }
`;
