import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_KEYWORD } from 'src/entity/misc/Keyword';

const OLD_TABLE = `${TABLE_KEYWORD}_old`;

export class KeywordCommand0001545509108 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.renameTable(TABLE_KEYWORD, OLD_TABLE);
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'controllerId',
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
        name: 'verb',
        type: 'varchar',
      }],
      name: 'keyword',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable(TABLE_KEYWORD);
    if (await query.hasTable(OLD_TABLE)) {
      await query.renameTable(OLD_TABLE, TABLE_KEYWORD);
    }
  }
}
