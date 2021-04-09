import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTransfers1617980395516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'transfers',
            columns: [
                {
                name: 'transfer_id',
                type: 'uuid',
                isPrimary: true,
                },
              {
                name: 'id',
                type: 'uuid',
              },
              {
                name: 'sender_id',
                type: 'uuid',
              },
              {
                name: 'description',
                type: 'varchar',
              },
              {
                name: 'amount',
                type: 'decimal',
                precision: 5,
                scale: 2,
              },
              {
                name: 'type',
                type: 'varchar',
              },
              {
                name: 'created_at',
                type: 'timestamp',
                default: 'now()'
              },
              {
                name: 'updated_at',
                type: 'timestamp',
                default: 'now()'
              }
            ],
            foreignKeys: [
              {
                name: 'FKUserId',
                columnNames: ['id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
              },
              {
                name: 'FKUserSender',
                columnNames: ['sender_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
              }
            ]
          }))
        }
      
        public async down(queryRunner: QueryRunner): Promise<void> {
          await queryRunner.dropTable('statements');
        }

}
