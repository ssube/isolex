import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_CONTEXT } from '../entity/Context';
import { COLUMN_NAME, COLUMN_UID } from './0001544311178-CreateContext';

const COLUMN_SOURCE = new TableColumn({
  name: 'source',
  type: 'varchar',
});

const COLUMN_TARGET = new TableColumn({
  name: 'target',
  type: 'varchar',
});

const COLUMN_USER = new TableColumn({
  name: 'sourceUser',
  type: 'varchar',
});

export class ContextUser0001618702349 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.dropColumn(TABLE_CONTEXT, 'name');
    await query.dropColumn(TABLE_CONTEXT, 'uid');

    await query.addColumn(TABLE_CONTEXT, COLUMN_USER);
    await query.addColumn(TABLE_CONTEXT, COLUMN_SOURCE);
    await query.addColumn(TABLE_CONTEXT, COLUMN_TARGET);
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropColumn(TABLE_CONTEXT, COLUMN_TARGET);
    await query.dropColumn(TABLE_CONTEXT, COLUMN_SOURCE);
    await query.dropColumn(TABLE_CONTEXT, COLUMN_USER);

    await query.addColumn(TABLE_CONTEXT, new TableColumn(COLUMN_NAME));
    await query.addColumn(TABLE_CONTEXT, new TableColumn(COLUMN_UID));
  }
}
