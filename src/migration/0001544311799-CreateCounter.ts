import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_COUNTER } from '../entity/misc/Counter';

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
      name: TABLE_COUNTER,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_COUNTER);
  }
}
