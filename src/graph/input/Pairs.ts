import { GraphQLInputObjectType, GraphQLList, GraphQLString } from 'graphql';

export const GRAPH_INPUT_NAME_VALUE_PAIR = new GraphQLInputObjectType({
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

export const GRAPH_INPUT_NAME_MULTI_VALUE_PAIR = new GraphQLInputObjectType({
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
