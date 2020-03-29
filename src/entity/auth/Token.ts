import { Dict, doesExist, InvalidArgumentError, makeDict, mustExist } from '@apextoaster/js-utils';
import { Algorithm, sign, verify } from 'jsonwebtoken';
import { newTrie } from 'shiro-trie';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { dateToSeconds } from '../../utils/Clock';
import { DataEntity, DataEntityOptions } from '../base/DataEntity';
import { Session } from '../Session';
import { User } from './User';

export interface JwtFields {
  aud: Array<string>;
  data: Dict<Array<string>>;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  nbf: number;
  sub: string;
}

export interface VerifiableTokenOptions {
  audience: Array<string>;
  issuer: string;
  subject: string;
}

export interface TokenOptions extends DataEntityOptions<Array<string>>, VerifiableTokenOptions {
  expiresAt: Date;
  grants: Array<string>;
  user?: User;
}

export const TABLE_TOKEN = 'token';

@Entity(TABLE_TOKEN)
export class Token extends DataEntity<Array<string>> implements TokenOptions {
  public static verify(token: string, secret: string, expected: Partial<VerifiableTokenOptions>): JwtFields {
    const data = verify(token, secret, expected);
    if (typeof data === 'object') {
      return data as JwtFields;
    } else {
      throw new InvalidArgumentError(`invalid token: ${data}`);
    }
  }

  /**
   * `aud` (Audience) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.3
   */
  @Column('simple-json')
  public audience: Array<string> = [];

  /**
   * `exp` (Expiration Time) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.4
   */
  @Column({
    type: 'datetime',
  })
  public expiresAt: Date = new Date();

  @Column('simple-json')
  public grants: Array<string> = [];

  /**
   * `jti` (JWT ID) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.7
   */
  @PrimaryGeneratedColumn('uuid')
  public id?: string;

  /**
   * `iss` (Issuer) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.1
   *
   * listener identifier
   */
  @Column({
    type: 'varchar',
  })
  public issuer = '';

  /**
   * `sub` (Subject) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.2
   *
   * userName
   */
  @Column({
    type: 'varchar',
  })
  public subject = '';

  @ManyToOne((type) => User, (user) => user.id, {
    cascade: true,
  })
  @JoinColumn({
    name: 'subject',
  })
  public user?: User;

  constructor(options: TokenOptions) {
    super(options);

    if (doesExist(options)) {
      this.audience = options.audience;
      this.expiresAt = options.expiresAt;
      this.grants = options.grants;
      this.issuer = options.issuer;
      this.subject = options.subject;
      this.user = options.user;
    }
  }

  /**
   * Check if a set of Shiro-style permissions have been granted to this token. This does not check the token's user,
   * only the token's grants.
   */
  public checkGrants(permissions: Array<string>): boolean {
    const trie = newTrie();
    trie.add(...this.grants);
    return permissions.every((p) => trie.check(p));
  }

  /**
   * Turn this token into an equivalent session.
   */
  public session(): Session {
    const user = mustExist(this.user);
    return {
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      user,
    };
  }

  /**
   * Produce a JWT from this token.
   */
  public sign(secret: string, algorithm: Algorithm = 'HS256') {
    return sign(this.toTokenJSON(), secret, {
      algorithm,
    });
  }

  public toJSON(): object {
    return {
      audience: this.audience,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      grants: this.grants,
      id: this.id,
      issuer: this.issuer,
      subject: this.subject,
    };
  }

  public toTokenJSON(): JwtFields {
    return {
      aud: this.audience,
      data: makeDict(this.data),
      exp: dateToSeconds(this.expiresAt),
      iat: dateToSeconds(this.createdAt),
      iss: this.issuer,
      jti: mustExist(this.id),
      nbf: dateToSeconds(this.createdAt),
      sub: this.subject,
    };
  }
}
