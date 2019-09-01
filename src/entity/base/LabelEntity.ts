import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { doesExist } from '../../utils';
import { makeMap, MapLike } from '../../utils/Map';
import { BaseEntity, BaseEntityOptions } from '../base/BaseEntity';

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
