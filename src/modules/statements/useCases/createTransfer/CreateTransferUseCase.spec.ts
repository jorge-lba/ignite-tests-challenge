import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryTransfersRepository } from "../../repositories/in-memory/inMemoryTransfersRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { CreateTransferUseCase } from "./CreateTransferUserCase"

describe("Create Transfer Use Case", () => {
  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  interface ICreateStatementDTO {
    user_id: string;
    amount: number;
    description: string;
    type: OperationType
  }

  const statementData: ICreateStatementDTO = {
    user_id: "",
    amount: 0,
    description: "Statement Test",
    type: OperationType.DEPOSIT
  }

  const userDataSender: ICreateUserDTO = {
    name: "Sender User",
    email: "sender@test.com",
    password: "test123"
  }

  const userDataReceiver: ICreateUserDTO = {
    name: "Receiver User",
    email: "receiver@test.com",
    password: "test123"
  }
  
  let usersRepositoryInMemory: InMemoryUsersRepository
  let statementsRepositoryInMemory: InMemoryStatementsRepository
  let transfersRepositoryInMemory: InMemoryTransfersRepository
  let createUserUseCase: CreateUserUseCase
  let createTransferUseCase: CreateTransferUseCase

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    transfersRepositoryInMemory = new InMemoryTransfersRepository()
    statementsRepositoryInMemory = new InMemoryStatementsRepository(transfersRepositoryInMemory)
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    createTransferUseCase = new CreateTransferUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory,
      transfersRepositoryInMemory
    )
  })

  it("should ne able to create a new transfer", async () => {
    const userSender = await createUserUseCase.execute(userDataSender)
    const userReceiver = await createUserUseCase.execute(userDataReceiver)

    await statementsRepositoryInMemory.create({
      ...statementData,
      user_id: `${userSender.id}`,
      amount: 5000
    })

    const transfer = await createTransferUseCase.execute({
      id: `${userSender.id}`,
      sender_id: `${userReceiver.id}`,
      amount: 3000,
      description: "Test Transfer"
    })

    expect(transfer.id).toBe(userSender.id)
    expect(transfer.sender_id).toBe(userReceiver.id)
    expect(transfer.amount).toBe(3000)
    expect(transfer.description).toBe("Test Transfer")
  })

  it("the balance must correspond to the transfer made", async () => {
    const userSender = await createUserUseCase.execute(userDataSender)
    const userReceiver = await createUserUseCase.execute(userDataReceiver)

    await statementsRepositoryInMemory.create({
      ...statementData,
      user_id: `${userSender.id}`,
      amount: 5000,
    })
    
    await createTransferUseCase.execute({ 
      id: `${userSender.id}`,
      sender_id: `${userReceiver.id}`,
      amount: 3000,
      description: "Test Transfer"
    })

    const senderBalancer = await statementsRepositoryInMemory.getUserBalance({user_id: `${userSender.id}`,with_statement: true})
    const receiverBalancer = await statementsRepositoryInMemory.getUserBalance({user_id: `${userReceiver.id}`, with_statement: true})

    expect(senderBalancer.balance).toBe(2000)
    expect(receiverBalancer.balance).toBe(3000)
  })

  it("should no be able to create a new transfer if it is balance sender user below necessary ", async () => {
    const userSender = await createUserUseCase.execute(userDataSender)
    const userReceiver = await createUserUseCase.execute(userDataReceiver)

    await expect(async () => await createTransferUseCase.execute({
      id: `${userSender.id}`,
      sender_id: `${userReceiver.id}`,
      amount: 3000,
      description: "Test Transfer"
    })).rejects.toBeInstanceOf(AppError)

  })
})