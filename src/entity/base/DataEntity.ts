import { doesExist, getOrDefault, makeMap, MapLike, MissingKeyError } from '@apextoaster/js-utils';
import { isNil } from 'lodash';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { LabelEntity, LabelEntityOptions } from '../base/LabelEntity';

export interface DataEntityOptions<TVal> extends LabelEntityOptions {
  data: MapLike<TVal>;
}

export abstract class DataEntity<TVal> extends LabelEntity {
  public data: Map<string, TVal> = new Map();

  @Column({
    name: 'data',
    type: 'varchar',
  })
  protected dataStr = '';

  constructor(options: DataEntityOptions<TVal>) {
    super(options);

    if (doesExist(options)) {
      this.data = makeMap(options.data);
    }
  }

  @AfterLoad()
  public syncMap() {
    super.syncMap();
    this.data = new Map(JSON.parse(this.dataStr));
  }

  @BeforeInsert()
  @BeforeUpdate()
  public syncStr() {
    super.syncStr();
    this.dataStr = JSON.stringify(Array.from(this.data));
  }

  public has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get a data item. Makes the command act like a read-only map.
   */
  public get(key: string): TVal {
    const value = this.data.get(key);
    if (isNil(value)) {
      throw new MissingKeyError(`missing key: ${key}`);
    }
    return value;
  }

  public getOrDefault(key: string, defaultValue: TVal): TVal {
    return getOrDefault(this.data, key, defaultValue);
  }

  public abstract toJSON(): object;
}
