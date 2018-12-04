import { ApolloServer, gql } from 'apollo-server';
import { BaseListener } from './BaseListener';
import { Listener, FetchOptions } from './Listener';
import { ChildServiceOptions } from 'src/ChildService';
import { Message } from 'src/entity/Message';

const books = [{
  title: 'test',
  author: 'test',
}];

const typeDefs = gql`
type Book {
  title: String
  author: String
}

type Query {
  books: [Book]
}
`;

const resolvers = {
  Query: {
    books: () => books,
  },
};

export interface ApolloListenerData {}
export type ApolloListenerOptions = ChildServiceOptions<ApolloListenerData>;

export class ApolloListener extends BaseListener<ApolloListenerData> implements Listener {
  protected server: ApolloServer;

  constructor(options: ApolloListenerOptions) {
    super(options);
    this.server = new ApolloServer({
      typeDefs,
      resolvers,
    });
  }

  public async start() {
    const info = await this.server.listen();
    this.logger.debug({ info }, 'started apollo server');
  }

  public async stop() {
    return this.server.stop();
  }

  public async emit() {

  }

  public async fetch(options: FetchOptions): Promise<Array<Message>> {
    return [];
  }
}