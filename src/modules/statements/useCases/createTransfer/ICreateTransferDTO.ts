import { Transfer } from "../../entities/Transfer";

export type ICreateTransferDTO =
Pick<
  Transfer,
  'id' |
  'sender_id' |
  'description' |
  'amount'
>
