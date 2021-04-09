import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO = {
  user_id: string,
  description: string,
  amount: number,
  type: string
  transfer_id?: string
}