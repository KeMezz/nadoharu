import { graphqlClient, type GraphQLResponse } from '@/lib/graphql';
import type { MeQuery } from './me.generated';
import meQueryDocument from './me.graphql';

export function fetchMe(): Promise<GraphQLResponse<MeQuery>> {
  return graphqlClient(meQueryDocument.trim());
}
