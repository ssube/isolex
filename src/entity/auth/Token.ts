import { sign, verify } from 'jsonwebtoken';
import { isNil } from 'lodash';
import { newTrie } from 'shiro-trie';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from 'src/entity/auth/User';
import { DataEntity, DataEntityOptions } from 'src/entity/base/DataEntity';
import { Session } from 'src/entity/Session';
import { InvalidArgumentError } from 'src/error/InvalidArgumentError';
import { dateToSeconds } from 'src/utils/Clock';
import { Dict, mapToDict } from 'src/utils/Map';

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

export interface TokenOptions extends Session, DataEntityOptions<Array<string>>, VerifiableTokenOptions {
  grants: Array<string>;
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
  public audience: Array<string>;

  /**
   * `exp` (Expiration Time) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.4
   */
  @Column({
    type: 'datetime',
  })
  public expiresAt: Date;

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

    if (!isNil(options)) {
      this.audience = options.audience;
      this.createdAt = options.createdAt;
      this.expiresAt = options.expiresAt;
      this.issuer = options.issuer;
      this.grants = Array.from(options.grants);
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

  /**
   * Turn this token into an equivalent session.
   */
  public session(): Session {
    return {
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      user: this.user,
    };
  }

  /**
   * Produce a JWT from this token.
   */
  public sign(secret: string, algorithm = 'HS256') {
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
      data: mapToDict(this.data),
      exp: dateToSeconds(this.expiresAt),
      iat: dateToSeconds(this.createdAt),
      iss: this.issuer,
      jti: this.id,
      nbf: dateToSeconds(this.createdAt),
      sub: this.subject,
    };
  }
}
