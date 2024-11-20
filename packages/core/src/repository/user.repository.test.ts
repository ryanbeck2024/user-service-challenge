import 'reflect-metadata' // FIXME vitest setup
import { describe, beforeEach, expect, test, vi, afterEach } from "vitest"
import { mockClient } from 'aws-sdk-client-mock'
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { IUserRepository, UserRepository } from "."

describe('UserRepository', () => {
  let userRepository: IUserRepository
  const dynamoDbMock = mockClient(DynamoDBDocumentClient)

  beforeEach(() => {
    dynamoDbMock.onAnyCommand().rejects(new Error('Command not mocked'))
    userRepository = new UserRepository(dynamoDbMock as unknown as DynamoDBDocumentClient)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    dynamoDbMock.reset()
  })

  test("create writes to ddb", async () => {
    dynamoDbMock.on(PutCommand).resolves({})

    await userRepository.create({
      userId: '123'
    })

    // FIXME: having some trouble with aws-sdk-client-mock-jest/vitest
    expect(dynamoDbMock.calls().length).toEqual(1)
    expect(dynamoDbMock.call(0).args[0].input).toEqual(expect.objectContaining({Item: expect.objectContaining({userId: '123'})}))
  })

  test("create detects duplicate", async () => {
    dynamoDbMock.on(PutCommand).rejects({name: 'ConditionalCheckFailedException'})

    await expect(userRepository.create({
      userId: '123',
    })).rejects.toThrow('User 123 already exists.')
  })


  test("read returns user", async () => {
    dynamoDbMock.on(GetCommand).resolves({Item: {userId: '123'}})

    const result = await userRepository.read('123')

    expect(result).toEqual({userId: '123'})
  })

  test("read returns user", async () => {
    dynamoDbMock.on(GetCommand).resolves({Item: {userId: '123'}})

    const result = await userRepository.read('123')

    expect(result).toEqual({userId: '123'})
  })

  test("read throws not found", async () => {
    dynamoDbMock.on(GetCommand).resolves({})

    await expect(userRepository.read('123')).rejects.toThrow('User Not Found')
  })

  test("update writes to ddb", async () => {
    dynamoDbMock.on(PutCommand).resolves({})

    await userRepository.update({
      userId: '123'
    })

    expect(dynamoDbMock.calls().length).toEqual(1)
  })

  test("delete", async () => {
    dynamoDbMock.on(DeleteCommand).resolves({})

    await userRepository.delete('123')

    expect(dynamoDbMock.calls().length).toEqual(1)
  })
})
