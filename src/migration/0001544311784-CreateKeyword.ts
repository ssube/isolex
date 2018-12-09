import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateKeyword0001544311784 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'name',
        type: 'varchar',
      }, {
        name: 'commandId',
        type: 'varchar',
      }, {
        name: 'controller',
        type: 'varchar',
      }],
      name: 'keyword',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable('keyword');
  }
}
