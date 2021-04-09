enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export type ICreateStatementDTO = {
  user_id: string,
  description: string,
  amount: number,
  type: OperationType
  transfer_id?: string
}