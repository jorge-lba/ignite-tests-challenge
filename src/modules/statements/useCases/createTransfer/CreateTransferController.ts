import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUserCase";

export class CreateTransferController {
  async execute(request:Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { amount, description } = request.body;
    const { id: sender_id } = request.params

    const createTransfer = container.resolve(CreateTransferUseCase)

    const transfer = await createTransfer.execute({
      id,
      sender_id,
      amount,
      description
    })

    return response.status(201).json(transfer)
  }
}