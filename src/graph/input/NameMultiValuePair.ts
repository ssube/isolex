import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

export const GRAPH_INPUT_NAME_MULTI_VALUE_PAIR = new GraphQLObjectType({
  fields: {
    name: {
      type: GraphQLString,
    },
    values: {
      type: new GraphQLList(GraphQLString),
    }
  },
  name: 'NameMultiValuePairInput',
});
