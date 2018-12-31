import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_FRAGMENT } from 'src/entity/Fragment';

const COLUMN_USER = new TableColumn({
  name: 'userId',
  type: 'varchar',
});

export class FragmentUser0001546283532 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.clearTable(TABLE_FRAGMENT);
    await query.addColumn(TABLE_FRAGMENT, COLUMN_USER);
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropColumn(TABLE_FRAGMENT, COLUMN_USER);
  }
}
