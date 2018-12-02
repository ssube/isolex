import { Context, ContextData } from 'src/entity/Context';
import { Service } from 'src/Service';

export interface SessionProvider extends Service {
  createSessionContext(ctx: ContextData): Promise<Context>;
}