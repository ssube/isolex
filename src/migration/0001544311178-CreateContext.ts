import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_CONTEXT } from '../entity/Context';

export const COLUMN_NAME = {
  name: 'name',
  type: 'varchar',
};

export const COLUMN_UID = {
  name: 'uid',
  type: 'varchar',
};

export class CreateContext0001544311178 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [
        {
          isPrimary: true,
          name: 'id',
          type: 'varchar',
        }, {
          name: 'channel',
          type: 'varchar',
        },
        COLUMN_NAME,
        COLUMN_UID,
      ],
      name: TABLE_CONTEXT,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_CONTEXT);
  }
}
