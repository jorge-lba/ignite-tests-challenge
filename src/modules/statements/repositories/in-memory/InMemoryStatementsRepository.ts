import { Statement } from "../../entities/Statement";
import { Transfer } from "../../entities/Transfer";
import { ICreateStatementDTO } from "../../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "../IStatementsRepository";
import { InMemoryTransfersRepository } from "./inMemoryTransfersRepository";

type IStatementDTO = Statement | Transfer 

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];

  constructor(
    private transfersRepository: InMemoryTransfersRepository
  ){}

  async create(data: ICreateStatementDTO): Promise<Statement> {
    const statement = new Statement();

    Object.assign(statement, data);

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(operation => (
      operation.id === statement_id &&
      operation.user_id === user_id
    ));
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: IStatementDTO[] }
    >
  {
    const statement = this.statements.filter(operation => operation.user_id === user_id);

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === 'deposit') {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0)

    if (with_statement) {
      const transfers = await this.transfersRepository.getTransfers()
      const statements = statement.map(statement => {
        const indexTransfer = transfers.findIndex(transfer => statement.transfer_id === transfer.transfer_id)        
        return indexTransfer < 0 
          ? statement 
          : transfers[indexTransfer]
      })

      return {
        statement: statements,
        balance
      }
    }

    return { balance }
  }
}
