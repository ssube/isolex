import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_ROLE } from '../entity/auth/Role';
import { TABLE_TOKEN } from '../entity/auth/Token';
import { TABLE_USER } from '../entity/auth/User';
import { TABLE_COMMAND } from '../entity/Command';
import { TABLE_CONTEXT } from '../entity/Context';
import { TABLE_FRAGMENT } from '../entity/Fragment';
import { TABLE_MESSAGE } from '../entity/Message';
import { TABLE_COUNTER } from '../entity/misc/Counter';
import { TABLE_KEYWORD } from '../entity/misc/Keyword';

// all entities except tick, which already has them
const EFFECTED_TABLES = [
  TABLE_COMMAND,
  TABLE_CONTEXT,
  TABLE_FRAGMENT,
  TABLE_MESSAGE,
  // auth
  TABLE_ROLE,
  TABLE_USER,
  // misc
  TABLE_COUNTER,
  TABLE_KEYWORD,
];

const COLUMN_CREATED = new TableColumn({
  default: '0',
  name: 'createdAt',
  type: 'varchar',
});

const COLUMN_UPDATED = new TableColumn({
  default: '0',
  name: 'updatedAt',
  type: 'varchar',
});

export class Dates0001546236755 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    for (const table of EFFECTED_TABLES) {
      await query.addColumns(table, [COLUMN_CREATED, COLUMN_UPDATED]);
    }

    await query.addColumn(TABLE_TOKEN, COLUMN_UPDATED);
  }

  public async down(query: QueryRunner): Promise<void> {
    for (const table of EFFECTED_TABLES) {
      await query.dropColumns(table, [COLUMN_CREATED, COLUMN_UPDATED]);
    }

    await query.dropColumn(TABLE_TOKEN, COLUMN_UPDATED);
  }
}
