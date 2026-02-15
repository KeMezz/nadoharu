export const PrismaClient = jest.fn().mockImplementation(() => ({
  user: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
}));
