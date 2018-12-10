import { newTrie } from 'shiro-trie';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Session } from 'src/listener/SessionListener';

import { DataEntity, DataEntityOptions } from '../base/DataEntity';
import { User } from './User';

export interface TokenOptions extends Session, DataEntityOptions<Array<string>> {
  audience: Array<string>;
  createdAt: number;
  expiresAt: number;
  issuer: string;
  subject: string;
}

@Entity()
export class Token extends DataEntity<Array<string>> implements TokenOptions {
  /**
   * `aud` (Audience) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.3
   */
  @Column('simple-json')
  public audience: Array<string>;

  /**
   * `iat` (Issued At) and `nbf` (Not Before) claims
   * https://tools.ietf.org/html/rfc7519#section-4.1.6
   * https://tools.ietf.org/html/rfc7519#section-4.1.5
   */
  @Column()
  public createdAt: number;

  /**
   * `exp` (Expiration Time) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.4
   */
  @Column()
  public expiresAt: number;

  @Column('simple-json')
  public grants: Array<string>;

  /**
   * `jti` (JWT ID) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.7
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * `iss` (Issuer) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.1
   *
   * listener identifier
   */
  @Column()
  public issuer: string;

  /**
   * `sub` (Subject) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.2
   *
   * userName
   */
  @Column()
  public subject: string;

  @ManyToOne((type) => User, (user) => user.id, {
    cascade: true,
  })
  @JoinColumn({
    name: 'subject',
  })
  public user: User;

  constructor(options?: TokenOptions) {
    super(options);

    if (options) {
      this.audience = options.audience;
      this.createdAt = options.createdAt;
      this.expiresAt = options.expiresAt;
      this.issuer = options.issuer;
      this.subject = options.subject;
    }
  }

  /**
   * Check if a set of Shiro-style permissions have been granted to this token. This does not check the token's user,
   * only the token's grants.
   */
  public permit(permissions: Array<string>): boolean {
    const trie = newTrie();
    trie.add(...this.grants);
    return permissions.every((p) => trie.check(p));
  }

  public toJSON(): object {
    return {
      id: this.id,
    };
  }
}
