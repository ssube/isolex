import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_MESSAGE } from 'src/entity/Message';

export class CreateMessage0001544311687 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'body',
        type: 'varchar',
      }, {
        name: 'contextId',
        type: 'varchar',
      }, {
        isNullable: true,
        name: 'labels',
        type: 'varchar',
      }, {
        name: 'reactions',
        type: 'varchar',
      }, {
        isNullable: false,
        name: 'type',
        type: 'varchar',
      }],
      name: TABLE_MESSAGE,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_MESSAGE);
  }
}
