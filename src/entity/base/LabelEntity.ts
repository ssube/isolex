import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { BaseEntity } from 'src/entity/base/BaseEntity';
import { MapLike } from 'src/utils/Map';

export interface LabelEntityOptions {
  labels: MapLike<string>;
}

export abstract class LabelEntity extends BaseEntity {
  public labels: Map<string, string> = new Map();

  @Column({
    name: 'labels',
  })
  protected labelStr: string = '';

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
