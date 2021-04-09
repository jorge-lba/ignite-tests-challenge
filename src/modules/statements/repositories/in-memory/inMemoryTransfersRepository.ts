import { v4 as uuid } from 'uuid'

import { Transfer } from "../../entities/Transfer";
import { ICreateTransferDTO } from "../../useCases/createTransfer/ICreateTransferDTO";
import { ITransfersRepository } from "../ITransfersRepository";

export class InMemoryTransfersRepository implements ITransfersRepository {
  private transfers: Transfer[] = [];

  async create(data: ICreateTransferDTO): Promise<Transfer> {
    const transfer = new Transfer();

    Object.assign(transfer, {
      transfer_id: uuid(),
      ...data,
      type: 'transfer',
      created_at: new Date(),
      updated_at: new Date()
    });

    this.transfers.push(transfer);

    return transfer;
  }

  async getTransfers():Promise<Transfer[]>{
    return this.transfers
  }
}