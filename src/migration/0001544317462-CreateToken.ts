import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_TOKEN } from 'src/entity/auth/Token';

export class CreateToken0001544317462 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'audience',
        type: 'varchar',
      }, {
        name: 'createdAt',
        type: 'int',
      }, {
        name: 'data',
        type: 'varchar',
      }, {
        name: 'expiresAt',
        type: 'int',
      }, {
        name: 'grants',
        type: 'varchar',
      }, {
        name: 'issuer',
        type: 'varchar',
      }, {
        name: 'labels',
        type: 'varchar',
      }, {
        name: 'subject',
        type: 'varchar',
      }],
      name: TABLE_TOKEN,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_TOKEN);
  }
}
