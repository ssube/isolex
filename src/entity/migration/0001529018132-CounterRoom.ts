import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CounterRoom0001529018132 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.addColumn('counter', new TableColumn({
      isNullable: true,
      name: 'roomId',
      type: 'varchar',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropColumn('counter', 'roomId');
  }
}

