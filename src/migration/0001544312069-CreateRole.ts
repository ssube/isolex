import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRole0001544312069 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
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
        name: 'grants',
        type: 'varchar',
      }],
      name: 'role',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable('role');
  }
}
