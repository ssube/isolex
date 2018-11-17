import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialSetup0001526853117 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'listenerId',
        type: 'varchar',
      }, {
        name: 'roomId',
        type: 'varchar',
      }, {
        name: 'threadId',
        type: 'varchar',
      }, {
        name: 'userId',
        type: 'varchar',
      }, {
        name: 'userName',
        type: 'varchar',
      }],
      name: 'context',
    }));

    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
      }, {
        name: 'contextId',
        type: 'varchar',
      }, {
        name: 'data',
        type: 'varchar',
      }, {
        name: 'noun',
        type: 'varchar',
      }, {
        name: 'verb',
        type: 'varchar',
      }],
      name: 'command',
    }));

    await query.createTable(new Table({
      columns: [{
        isPrimary: true,
        name: 'id',
        type: 'varchar',
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
      name: 'message',
    }));

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
      name: 'keyword',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropTable('context');
    await query.dropTable('command');
    await query.dropTable('message');
    await query.dropTable('keyword');
  }
}
