import request from "supertest"
import jwt from "jsonwebtoken"

import { Connection, createConnection } from "typeorm"

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { v4 as uuid } from "uuid"

import { app } from "../../../../app"
import authConfig from '../../../../config/auth'
import { User } from "../../../users/entities/User"

describe("Create Transfer Use Case", () => {
  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  interface ITokenUser {
    user: User,
    token: string,
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
  
  let db: Connection

  beforeAll( async() => {
    db = await createConnection()
    await db.runMigrations()
  })

  afterAll(async () => {
    await db.dropDatabase();
    await db.close();
  });

  it("should ne able to create a new transfer", async () => {

    await request(app).post("/api/v1/users").send(userDataSender)
    await request(app).post("/api/v1/users").send(userDataReceiver)

    const userSenderAuth = await request(app).post("/api/v1/sessions").send({
      email: userDataSender.email,
      password: userDataSender.password
    })

    const token = userSenderAuth.body.token

    const userReceiverAuth = await request(app).post("/api/v1/sessions").send({
      email: userDataReceiver.email,
      password: userDataReceiver.password
    })

    const dp = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 500,
      description: statementData.description
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    const transfer = await request(app).post(`/api/v1/statements/transfer/${userReceiverAuth.body.user.id}`).send({
      amount: 50,
      description: "Test Transfer"
    }).set({
      Authorization: `Bearer ${token}`,
    })

    const response = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${userSenderAuth.body.token}`,
      })

    console.log(transfer.body)
    console.log(response.body.statement)

  })

  // it("the balance must correspond to the transfer made", async () => {
  //   const userSender = await createUserUseCase.execute(userDataSender)
  //   const userReceiver = await createUserUseCase.execute(userDataReceiver)

  //   await statementsRepositoryInMemory.create({
  //     ...statementData,
  //     user_id: `${userSender.id}`,
  //     amount: 5000,
  //   })
    
  //   await createTransferUseCase.execute({ 
  //     id: `${userSender.id}`,
  //     sender_id: `${userReceiver.id}`,
  //     amount: 3000,
  //     description: "Test Transfer"
  //   })

  //   const senderBalancer = await statementsRepositoryInMemory.getUserBalance({user_id: `${userSender.id}`,with_statement: true})
  //   const receiverBalancer = await statementsRepositoryInMemory.getUserBalance({user_id: `${userReceiver.id}`, with_statement: true})

  //   console.log(senderBalancer)
  //   console.log(receiverBalancer)

  //   expect(senderBalancer.balance).toBe(2000)
  //   expect(receiverBalancer.balance).toBe(3000)
  // })

  // it("should no be able to create a new transfer if it is balance sender user below necessary ", async () => {
  //   const userSender = await createUserUseCase.execute(userDataSender)
  //   const userReceiver = await createUserUseCase.execute(userDataReceiver)

  //   await expect(async () => await createTransferUseCase.execute({
  //     id: `${userSender.id}`,
  //     sender_id: `${userReceiver.id}`,
  //     amount: 3000,
  //     description: "Test Transfer"
  //   })).rejects.toBeInstanceOf(AppError)

  // })
})