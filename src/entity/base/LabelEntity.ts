import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { BaseEntity, BaseEntityOptions } from 'src/entity/base/BaseEntity';
import { doesExist } from 'src/utils';
import { makeMap, MapLike } from 'src/utils/Map';

export interface LabelEntityOptions extends BaseEntityOptions {
  labels: MapLike<string>;
}

export abstract class LabelEntity extends BaseEntity {
  public labels: Map<string, string> = new Map();

  @Column({
    name: 'labels',
  })
  protected labelStr: string = '';

  constructor(options: LabelEntityOptions) {
    super(options);

    if (doesExist(options)) {
      this.labels = makeMap(options.labels);
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
