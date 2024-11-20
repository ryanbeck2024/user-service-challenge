import { inject, injectable } from 'tsyringe'
import { Resource } from "sst"
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { User } from '../model'
import { Util } from '../util'

export interface IUserRepository {
  create(user: User): Promise<void>
  read(userId: string): Promise<User>
  update(user: User): Promise<void>
  delete(userId: string): Promise<void>
}

@injectable()
export class UserRepository implements IUserRepository {

  constructor(@inject('dynamoDb') private readonly dynamoDb: DynamoDBDocumentClient) {}

  async create(user: User): Promise<void> {
    try {
      const result = await this.dynamoDb.send(new PutCommand({
        TableName: Resource.UserTable.name,
        Item: user,
        ConditionExpression: 'attribute_not_exists(userId)',
      }))
    } catch (err: any) {
      if ((err as {name?: string}).name === 'ConditionalCheckFailedException') {
        throw new Util.HttpError(`User ${user.userId} already exists.`, 409)
      }
      throw err
    }
  }

  async read(userId: string): Promise<User> {
    const result = await this.dynamoDb.send(new GetCommand({
      TableName: Resource.UserTable.name,
      Key: { userId },
    }))
    if (!result.Item) {
      throw new Util.HttpError('User Not Found', 404)
    }
    return result.Item as User
  }

  async update(user: User): Promise<void> {
    const result = await this.dynamoDb.send(new PutCommand({
      TableName: Resource.UserTable.name,
      Item: user,
    }))
  }

  async delete(userId: string): Promise<void> {
    const result = await this.dynamoDb.send(new DeleteCommand({
      TableName: Resource.UserTable.name,
      Key: { userId },
    }))
  }
}
