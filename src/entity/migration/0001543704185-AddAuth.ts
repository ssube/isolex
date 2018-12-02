import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddAuth0001543704185 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'name',
        type: 'varchar',
      }, {
        name: 'grants',
        type: 'varchar',
      }],
      name: 'role',
    }));

    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'data',
        type: 'varchar',
      }, {
        name: 'listenerId',
        type: 'varchar',
      }, {
        name: 'user',
        type: 'varchar',
      }],
      name: 'session',
    }));

    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'name',
        type: 'varchar',
      }, {
        name: 'roles',
        type: 'varchar',
      }],
      name: 'user',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable('role');
    await query.dropTable('session');
    await query.dropTable('user');
  }
}