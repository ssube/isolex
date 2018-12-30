import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUser0001544312112 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        isUnique: true,
        name: 'name',
        type: 'varchar',
      }, {
        name: 'roles',
        type: 'varchar',
      }],
      name: 'user',
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable('user');
  }
}
