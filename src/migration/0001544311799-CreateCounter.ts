import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCounter0001544311799 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        name: 'channel',
        type: 'varchar',
      }, {
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

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable('counter');
  }
}
