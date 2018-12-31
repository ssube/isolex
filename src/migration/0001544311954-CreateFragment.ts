import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_FRAGMENT } from 'src/entity/Fragment';

export class CreateFragment0001544311954 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'data',
        type: 'varchar',
      }, {
        name: 'key',
        type: 'varchar',
      }, {
        name: 'labels',
        type: 'varchar',
      }, {
        name: 'noun',
        type: 'varchar',
      }, {
        name: 'parserId',
        type: 'varchar',
      }, {
        name: 'verb',
        type: 'varchar',
      }],
      name: TABLE_FRAGMENT,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_FRAGMENT);
  }
}
