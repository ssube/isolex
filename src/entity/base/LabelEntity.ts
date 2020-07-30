import { doesExist, makeMap, MapLike } from '@apextoaster/js-utils';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { BaseEntity, BaseEntityOptions } from '../base/BaseEntity';

export interface LabelEntityOptions extends BaseEntityOptions {
  labels: MapLike<string>;
}

export abstract class LabelEntity extends BaseEntity {
  public labels: Map<string, string> = new Map();

  @Column({
    name: 'labels',
    type: 'varchar',
  })
  protected labelStr = '';

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

  /* eslint-disable-next-line @typescript-eslint/ban-types */
  public abstract toJSON(): object;
}
