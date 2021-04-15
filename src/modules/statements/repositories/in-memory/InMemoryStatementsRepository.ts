import { User } from "../../../users/entities/User";
import { Statement } from "../../entities/Statement";
import { Transfer } from "../../entities/Transfer";
import { ICreateStatementDTO } from "../../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "../IStatementsRepository";
import { InMemoryTransfersRepository } from "./inMemoryTransfersRepository";

interface IStatementDTO {
  id?: string;
  user_id: string;
  user: User;
  description: string;
  amount: number;
  transfer_id?: string;
  transfer: Transfer | undefined;
  type: any;
  created_at: Date;
  updated_at: Date;
}  

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

  async getUserBalance({ user_id }: IGetBalanceDTO):
    Promise<{ balance: number, statement: IStatementDTO[] }>
  {
    const statement = this.statements.filter(operation => operation.user_id === user_id) as IStatementDTO[];

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === 'deposit') {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0)
    
    const transfers = await this.transfersRepository.getTransfers()
    const statements = statement.map(statement => {
      statement.transfer = transfers.find(transfer => transfer.transfer_id === statement.transfer_id)
      return statement
    })

    return {
      statement: statements,
      balance
    }
  }
}
