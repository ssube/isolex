import { BaseOptions, Container } from 'noicejs';
import { Connection, ConnectionOptions, createConnection, Repository } from 'typeorm';

import { BaseService, BaseServiceData, BaseServiceOptions } from '../BaseService';
import { StorageLogger } from '../logger/StorageLogger';
import { ServiceLifecycle } from '../Service';
import { mustExist } from '../utils';

export interface StorageData extends BaseServiceData {
  migrate: boolean;
  orm: ConnectionOptions;
}

export interface StorageOptions extends BaseServiceOptions<StorageData> {
  data: StorageData;
}

export class Storage extends BaseService<StorageData> implements ServiceLifecycle {
  protected connection?: Connection;
  protected container: Container;

  constructor(options: StorageOptions) {
    super(options, 'isolex#/definitions/service-storage');

    this.container = options.container;
  }

  public async start(): Promise<void> {
    this.logger.debug(this.data, 'starting storage');
    const storageLogger = await this.container.create(StorageLogger);
    const entities = await this.container.create<Array<Function>, BaseOptions>('entities');
    const migrations = await this.container.create<Array<Function>, BaseOptions>('migrations');

    this.logger.info('connecting to storage');

    try {
      this.connection = await createConnection({
        ...this.data.orm,
        entities,
        logger: storageLogger,
        migrations,
      });

      if (this.data.migrate) {
        this.logger.info('running pending database migrations');
        await this.connection.runMigrations();
        this.logger.info('database migrations complete');
      } else {
        this.logger.info('skipping database migrations');
      }
    } catch (err) {
      this.logger.error(err, 'error connecting to storage');
      throw err;
    }
  }

  public async stop() {
    await mustExist(this.connection).close();
  }

  public getRepository<TEntity>(ctor: Function | (new () => TEntity)): Repository<TEntity> {
    return mustExist(this.connection).getRepository(ctor);
  }

  public getCustomRepository<TRepo>(ctor: Function | (new () => TRepo)): TRepo {
    return mustExist(this.connection).getCustomRepository(ctor);
  }

  public get isConnected(): boolean {
    return mustExist(this.connection).isConnected;
  }
}
