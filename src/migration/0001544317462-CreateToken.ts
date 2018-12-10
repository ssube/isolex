import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateToken0001544317462 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
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
      name: 'token',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable('token');
  }
}
