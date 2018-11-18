import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MessageType0001542414714 implements MigrationInterface {
  public async up(query: QueryRunner): Promise<any> {
    await query.addColumn('message', new TableColumn({
      isNullable: false,
      name: 'type',
      type: 'varchar',
    }));
  }

  public async down(query: QueryRunner): Promise<any> {
    await query.dropColumn('message', 'type');
  }
}
