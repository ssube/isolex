import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_CONTEXT } from 'src/entity/Context';

export class CreateContext0001544311178 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'channel',
        type: 'varchar',
      }, {
        name: 'name',
        type: 'varchar',
      }, {
        name: 'uid',
        type: 'varchar',
      }],
      name: TABLE_CONTEXT,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_CONTEXT);
  }
}
