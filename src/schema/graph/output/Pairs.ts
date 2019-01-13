import { GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';

export const GRAPH_OUTPUT_NAME_VALUE_PAIR = new GraphQLObjectType({
  fields: {
    name: {
      type: GraphQLString,
    },
    value: {
      type: GraphQLString,
    },
  },
  name: 'NameValuePair',
});

export const GRAPH_OUTPUT_NAME_MULTI_VALUE_PAIR = new GraphQLObjectType({
  fields: {
    name: {
      type: GraphQLString,
    },
    value: {
      type: new GraphQLList(GraphQLString),
    },
  },
  name: 'NameMultiValuePair',
});
