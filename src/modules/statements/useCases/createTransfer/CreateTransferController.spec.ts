import request from "supertest"
import jwt from "jsonwebtoken"

import { Connection, createConnection, LessThanOrEqual } from "typeorm"

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

    await request(app).post("/api/v1/statements/deposit")
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

    const balance = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${userSenderAuth.body.token}`,
      })

    expect(transfer.body.amount).toEqual(50)
    expect(transfer.body.description).toEqual("Test Transfer")
    expect(transfer.body).toHaveProperty("id")
    expect(transfer.body).toHaveProperty("sender_id")
    expect(transfer.body).toHaveProperty("transfer_id")

    expect(balance.body.balance).toEqual(450)

  })

  it("should no be able to create a new transfer if it is balance sender user below necessary", async () => {
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

    const response = await request(app).post(`/api/v1/statements/transfer/${userReceiverAuth.body.user.id}`).send({
      amount: 3000,
      description: "Test Transfer"
    }).set({
      Authorization: `Bearer ${token}`,
    })

    expect(response.body.message).toEqual('Balance below necessary.')
   
  })
})