import { getRepository, Repository } from "typeorm";
import { Transfer } from "../entities/Transfer";
import { ICreateTransferDTO } from "../useCases/createTransfer/ICreateTransferDTO";
import { ITransfersRepository } from "./ITransfersRepository";


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer'
}


export class TransfersRepository implements ITransfersRepository{
  private repository: Repository<Transfer>

  constructor(){
    this.repository = getRepository(Transfer)
  }

  async create({
    id,
    sender_id,
    amount,
    description
  }: ICreateTransferDTO):Promise<Transfer>{
    const transfer = this.repository.create({
      id,
      sender_id,
      amount,
      description,
      type: 'transfer'
    })

    return await this.repository.save(transfer)
  }
  getTransfers: () => Promise<Transfer[]>;
}