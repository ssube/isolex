import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { getOrDefault, dictToMap, MapLike } from 'src/utils/Map';

import { LabelEntity, LabelEntityOptions } from './LabelEntity';

export interface DataEntityOptions<TVal> extends LabelEntityOptions {
  data: MapLike<TVal>;
}

export abstract class DataEntity<TVal> extends LabelEntity {
  public data: Map<string, TVal>;

  @Column({
    name: 'data',
  })
  protected dataStr: string;

  constructor(options?: DataEntityOptions<TVal>) {
    super(options);

    if (options) {
      this.data = dictToMap(options.data);
    } else {
      this.data = new Map();
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
    if (value === undefined) {
      throw new Error(`missing key: ${key}`);
    }
    return value;
  }

  public getOrDefault(key: string, defaultValue: TVal): TVal {
    return getOrDefault(this.data, key, defaultValue);
  }

  public abstract toJSON(): object;
}
