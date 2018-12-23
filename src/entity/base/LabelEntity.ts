import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { BaseEntity } from 'src/entity/base/BaseEntity';
import { dictToMap, MapLike } from 'src/utils/Map';

export interface LabelEntityOptions {
  labels: MapLike<string>;
}

export abstract class LabelEntity extends BaseEntity {
  public labels: Map<string, string>;

  @Column({
    name: 'labels',
  })
  protected labelStr: string;

  constructor(options?: LabelEntityOptions) {
    super();

    if (options) {
      this.labels = dictToMap(options.labels);
    } else {
      this.labels = new Map();
    }
  }

  @AfterLoad()
  public syncMap() {
    this.labels = new Map(JSON.parse(this.labelStr));
  }

  @BeforeInsert()
  @BeforeUpdate()
  public syncStr() {
    this.labelStr = JSON.stringify(Array.from(this.labels));
  }

  public abstract toJSON(): object;
}
