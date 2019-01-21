import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { TABLE_USER } from 'src/entity/auth/User';

const COLUMN_LOCALE = new TableColumn({
  default: '\'{}\'',
  name: 'locale',
  type: 'varchar',
});

export class UserLocale0001548049058 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.addColumn(TABLE_USER, COLUMN_LOCALE);
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropColumn(TABLE_USER, COLUMN_LOCALE);
  }
}
