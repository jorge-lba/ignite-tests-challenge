import { Transfer } from "../entities/Transfer";
import { ICreateTransferDTO } from "../useCases/createTransfer/ICreateTransferDTO";

export interface ITransfersRepository {
  create: (data: ICreateTransferDTO) => Promise<Transfer>;
  getTransfers:() => Promise<Transfer[]>
}
