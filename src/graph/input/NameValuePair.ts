import { GraphQLObjectType, GraphQLString } from 'graphql';

export const GRAPH_INPUT_NAME_VALUE_PAIR = new GraphQLObjectType({
  fields: {
    name: {
      type: GraphQLString,
    },
    value: {
      type: GraphQLString,
    }
  },
  name: 'NameValuePairInput',
});
