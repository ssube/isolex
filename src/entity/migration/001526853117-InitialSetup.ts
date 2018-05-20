import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialSetup0001526853117 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.createTable(new Table({
      columns: [{
        name: 'id',
        type: 'varchar',
        isPrimary: true
      }, {
        name: 'listenerId',
        type: 'varchar'
      }, {
        name: 'roomId',
        type: 'varchar'
      }, {
        name: 'threadId',
        type: 'varchar'
      }, {
        name: 'userId',
        type: 'varchar'
      }, {
        name: 'userName',
        type: 'varchar'
      }],
      name: 'context',
    }));

    await query.createTable(new Table({
      columns: [{
        name: 'id',
        type: 'varchar',
        isPrimary: true
      }, {
        name: 'contextId',
        type: 'varchar',
      }, {
        name: 'data',
        type: 'varchar',
      }, {
        name: 'name',
        type: 'varchar',
      }, {
        name: 'type',
        type: 'varchar',
      }],
      name: 'command'
    }));

    await query.createTable(new Table({
      columns: [{
        name: 'id',
        type: 'varchar',
        isPrimary: true,
      }, {
        name: 'body',
        type: 'varchar',
      }, {
        name: 'contextId',
        type: 'varchar',
      }, {
        name: 'reactions',
        type: 'varchar',
      }],
      name: 'message'
    }));

    await query.createTable(new Table({
      columns: [{
        name: 'commandId',
        type: 'varchar',
      }, {
        name: 'handler',
        type: 'varchar',
      }, {
        name: 'name',
        type: 'varchar',
      }],
      name: 'trigger'
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable('context');
  }
}
