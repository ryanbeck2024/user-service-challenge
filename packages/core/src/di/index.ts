import 'reflect-metadata'
import { container } from "tsyringe"
import { UserService } from '../service'
import { UserRepository } from '../repository'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

container.register("UserService", {
  useClass: UserService
})

container.register("UserRepository", {
  useClass: UserRepository
})

container.register("dynamoDb", {
  useValue: DynamoDBDocumentClient.from(new DynamoDBClient({}))
})

export { container }
