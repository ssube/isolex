import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_KEYWORD } from 'src/entity/misc/Keyword';

export class CreateKeyword0001544311784 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'name',
        type: 'varchar',
      }, {
        name: 'commandId',
        type: 'varchar',
      }, {
        name: 'controller',
        type: 'varchar',
      }],
      name: TABLE_KEYWORD,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_KEYWORD);
  }
}
