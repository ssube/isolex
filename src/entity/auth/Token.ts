import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface TokenOptions {
  audience: Array<string>;
  createdAt: number;
  expiresAt: number;
  issuer: string;
  subject: string;
}

@Entity()
export class Token implements TokenOptions {
  /**
   * `aud` (Audience) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.3
   */
  @Column('simple-array')
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

  /**
   * `jti` (JWT ID) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.7
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * `iss` (Issuer) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.1
   */
  @Column()
  public issuer: string;

  /**
   * `sub` (Subject) claim
   * https://tools.ietf.org/html/rfc7519#section-4.1.2
   */
  @Column()
  public subject: string;

  constructor(options?: TokenOptions) {
    if (options) {
      this.audience = options.audience;
      this.createdAt = options.createdAt;
      this.expiresAt = options.expiresAt;
      this.issuer = options.issuer;
      this.subject = options.subject;
    }
  }
}
