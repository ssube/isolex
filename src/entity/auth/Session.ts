import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from 'src/entity/base/BaseEntity';

import { User } from './User';

export interface SessionData {
  listenerId: string;
  user: User;
  userName: string;
}

@Entity()
export class Session extends BaseEntity {
  public static create(options: SessionData) {
    const session = new Session();
    session.listenerId = options.listenerId;
    session.user = options.user;
    session.userName = options.userName;
    return session;
  }

  public data: Map<string, Array<string>>;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public listenerId: string;

  @ManyToOne((type) => User, (user) => user.id, {
    cascade: true,
  })
  public user: User;

  /**
   * The user ID (typically from context) which the listener name uses to associate sessions.
   *
   * This is a listener-defined value and may be meaningless.
   */
  @Column()
  public userName: string;

  @Column({
    name: 'data',
  })
  protected dataStr: string;

  constructor() {
    super();

    this.data = new Map();
  }

  @AfterLoad()
  public syncMap() {
    this.data = new Map(JSON.parse(this.dataStr));
  }

  @BeforeInsert()
  @BeforeUpdate()
  public syncStr() {
    this.dataStr = JSON.stringify(Array.from(this.data));
  }

  public toJSON(): object {
    return {
      id: this.id,
      listenerId: this.listenerId,
      // user: this.user.toJSON(),
      userName: this.userName,
    };
  }
}
