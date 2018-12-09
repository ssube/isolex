import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_COMMAND } from 'src/entity/Command';

export class CreateCommand0001544311565 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'contextId',
        type: 'varchar',
      }, {
        name: 'data',
        type: 'varchar',
      }, {
        isNullable: true,
        name: 'labels',
        type: 'varchar',
      }, {
        name: 'noun',
        type: 'varchar',
      }, {
        name: 'verb',
        type: 'varchar',
      }],
      name: TABLE_COMMAND,
    }));

  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable(TABLE_COMMAND);
  }
}
