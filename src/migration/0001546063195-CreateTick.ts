import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_TICK } from '../entity/Tick';

export class CreateTick0001546063195 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'createdAt',
        type: 'int',
      }, {
        name: 'intervalId',
        type: 'varchar',
      }, {
        name: 'status',
        type: 'int',
      }, {
        name: 'updatedAt',
        type: 'int',
      }],
      name: TABLE_TICK,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_TICK);
  }
}
