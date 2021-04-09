import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Transfer } from "../../entities/Transfer";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ITransfersRepository } from "../../repositories/ITransfersRepository";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,
    @inject("TransfersRepository")
    private transfersRepository: ITransfersRepository
  ){}

  async execute({id, sender_id, amount, description}: ICreateTransferDTO): Promise<Transfer>{
    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }

    const senderStatement = await this.statementsRepository.getUserBalance({user_id: `${id}`})

    if(senderStatement.balance < amount){
      throw new AppError("Balance below necessary.")
    }

    const transfer = await this.transfersRepository.create({
      id, 
      sender_id, 
      amount, 
      description
    })

    const withdraw = await this.statementsRepository.create({
      user_id: `${id}`,
      amount,
      description,
      type: OperationType.WITHDRAW,
      transfer_id: transfer.transfer_id
    })

    const deposit = await this.statementsRepository.create({
      user_id: `${sender_id}`,
      amount,
      description,
      type: OperationType.DEPOSIT,
      transfer_id:transfer.transfer_id
    })

    return transfer
  }
}