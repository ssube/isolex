import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import { TABLE_ROLE } from '../entity/auth/Role';

export class CreateRole0001544312069 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<void> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        isUnique: true,
        name: 'name',
        type: 'varchar',
      }, {
        name: 'grants',
        type: 'varchar',
      }],
      name: TABLE_ROLE,
    }));
  }

  public async down(query: QueryRunner): Promise<void> {
    await query.dropTable(TABLE_ROLE);
  }
}
