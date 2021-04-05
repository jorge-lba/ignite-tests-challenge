import request from "supertest"
import { Connection, createConnection } from 'typeorm';

import { app } from "../../../../app"
import { ICreateUserDTO } from "./ICreateUserDTO"

describe("Create User Controller", () => {
  let db: Connection

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

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send(userData)
    expect(response.status).toBe(201)
  })

  it("should not be able to create a user if it exists", async() => {
    const response = await request(app).post("/api/v1/users").send(userData)
    expect(response.status).toBe(400)
  })
})