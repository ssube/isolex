import { mustExist } from '@apextoaster/js-utils';
import { Container, Inject } from 'noicejs';
import { Connection, ConnectionOptions, createConnection, Repository } from 'typeorm';

import { BaseService, BaseServiceData, BaseServiceOptions } from '../BaseService';
import { BaseEntity } from '../entity/base/BaseEntity';
import { StorageLogger } from '../logger/StorageLogger';
import { INJECT_ENTITIES } from '../module/EntityModule';
import { INJECT_MIGRATIONS } from '../module/MigrationModule';
import { ServiceLifecycle } from '../Service';

export const INJECT_STORAGE_LOGGER = Symbol('inject-storage-logger');

export interface StorageData extends BaseServiceData {
  migrate: boolean;
  orm: ConnectionOptions;
}

export interface StorageOptions extends BaseServiceOptions<StorageData> {
  data: StorageData;
  [INJECT_ENTITIES]?: Array<Function>;
  [INJECT_MIGRATIONS]?: Array<Function>;
  [INJECT_STORAGE_LOGGER]?: StorageLogger;
}

/**
 * @typescript-eslint/tslint/config and @typescript-eslint/type-annotation-spacing disagree on the space
 * between `()` and `=>`, so prefer the spaced version
 */
/* eslint-disable-next-line @typescript-eslint/type-annotation-spacing */
export type EntityBase<T> = Function | (new () => T);

@Inject(INJECT_ENTITIES, INJECT_MIGRATIONS, {
  contract: StorageLogger,
  name: INJECT_STORAGE_LOGGER,
})
export class Storage extends BaseService<StorageData> implements ServiceLifecycle {
  protected connection?: Connection;
  protected container: Container;
  protected entities: Array<Function>;
  protected migrations: Array<Function>;
  protected storageLogger: StorageLogger;

  constructor(options: StorageOptions) {
    super(options, 'isolex#/definitions/service-storage');

    this.container = options.container;
    this.entities = mustExist(options[INJECT_ENTITIES]);
    this.migrations = mustExist(options[INJECT_MIGRATIONS]);
    this.storageLogger = mustExist(options[INJECT_STORAGE_LOGGER]);
  }

  public async start(): Promise<void> {
    this.logger.debug(this.data, 'starting storage');
    this.logger.info('connecting to storage');

    try {
      this.connection = await createConnection({
        ...this.data.orm,
        entities: this.entities,
        logger: this.storageLogger,
        migrations: this.migrations,
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

  public getRepository<TEntity>(ctor: EntityBase<TEntity>): Repository<TEntity> {
    return mustExist(this.connection).getRepository(ctor);
  }

  public getCustomRepository<TRepo extends Repository<TEntity>, TEntity extends BaseEntity>(ctor: EntityBase<TRepo>): TRepo {
    return mustExist(this.connection).getCustomRepository(ctor);
  }

  public get isConnected(): boolean {
    return mustExist(this.connection).isConnected;
  }
}
