import request from "supertest"
import jwt from "jsonwebtoken"

import { Connection, createConnection } from 'typeorm'

import { app } from "../../../../app"
import authConfig from '../../../../config/auth'
import { ICreateUserDTO } from "../createUser/ICreateUserDTO"
import { User } from "../../entities/User"

describe("Show User Profile Controller", () => {
  let db: Connection

  interface ITokenUser {
    user: User,
    token: string,
  }

  beforeAll( async() => {
    db = await createConnection()
    await db.runMigrations()

  })
  
  afterAll(async () => {
    await db.dropDatabase();
    await db.close();
  });
  
  const userData: ICreateUserDTO = {
    name: "Test User",
    email: "user@test.com",
    password: "test123"
  }
  
  it("should be able to get information user by id", async () => {
    await request(app).post("/api/v1/users").send(userData)
    
    const createUser = await request(app).post("/api/v1/sessions").send({
      email: userData.email,
      password: userData.password
    })

    const { user, token } = createUser.body

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty("id")
    expect(response.body).not.toHaveProperty("password")
    expect(response.body.name).toEqual(userData.name)
    expect(response.body.email).toEqual(userData.email)
    expect(response.body.password).not.toEqual(userData.password)
  })

  it("should no be able to get information user if it id is invalid", async() => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer -invalid-token`,
    });

    expect(response.status).toBe(401)
  })
})