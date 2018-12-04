import { AfterLoad, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { BaseEntity } from './BaseEntity';

export abstract class LabelEntity extends BaseEntity {
  public labels: Map<string, string>;

  @Column({
    name: 'labels',
  })
  protected labelStr: string;

  constructor() {
    super();
    this.labels = new Map();
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
