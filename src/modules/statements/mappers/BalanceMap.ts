import { Statement } from "../entities/Statement";
import { Transfer } from "../entities/Transfer";
type ViewStatement = {
  id?: string;
  statement_id?: string;
  user_id?: string;
  description: string;
  amount: number;
  type: string;
  transfer?: Transfer,
  created_at: Date;
  updated_at: Date;
}

export class BalanceMap {
  static toDTO({statement, balance}: { statement: ViewStatement[], balance: number}) {
    const parsedStatement = statement.map(({
      id,
      amount,
      description,
      type,
      created_at,
      updated_at,
      transfer
    }) => transfer
    ? {
      id: transfer.id,
      sender_id: transfer.sender_id,
      statement_id: id,
      amount: transfer.amount,
      description: transfer.description,
      type: transfer.type,
      created_at: transfer.created_at,
      updated_at: transfer.updated_at,
    }
    :{
      id,
      amount,
      description,
      type,
      created_at,
      updated_at,
    });

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
