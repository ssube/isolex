import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddCounter0001527939908 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'name',
        type: 'varchar',
      }, {
        name: 'count',
        type: 'int',
      }],
      name: 'counter',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable('counter');
  }
}
