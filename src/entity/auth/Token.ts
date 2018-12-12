import { sign, verify } from 'jsonwebtoken';
import { newTrie } from 'shiro-trie';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Session } from 'src/listener/SessionListener';
import { mapToDict } from 'src/utils/Map';

import { DataEntity, DataEntityOptions } from '../base/DataEntity';
import { User } from './User';

export interface VerifiableTokenOptions {
  audience: Array<string>;
  issuer: string;
  subject: string;
}

export interface TokenOptions extends Session, DataEntityOptions<Array<string>>, VerifiableTokenOptions {
  createdAt: number;
  expiresAt: number;
  grants: Array<string>;
}

@Entity()
export class Token extends DataEntity<Array<string>> implements TokenOptions {
  public static verify(token: string, secret: string, expected: Partial<VerifiableTokenOptions>): any {
    return verify(token, secret, {
      audience: expected.audience,
      issuer: expected.issuer,
      subject: expected.subject,
    });
  }

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

  public toTokenJSON() {
    return {
      aud: this.audience,
      data: mapToDict(this.data),
      exp: this.expiresAt,
      iat: this.createdAt,
      iss: this.issuer,
      jti: this.id,
      nbf: this.createdAt,
      sub: this.subject,
    };
  }
}
