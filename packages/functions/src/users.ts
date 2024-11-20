import { container } from "@user-service-challenge/core/di"
import { Util } from "@user-service-challenge/core/util"
import { IUserService } from "@user-service-challenge/core/service"

export const createUser = Util.handler(async (event) => {
  const user = JSON.parse(event.body ?? '{}')

  const us: IUserService = container.resolve("UserService")
  const result = await us.create(user)

  return Util.apigwResponse(result, undefined, 201)
})

export const readUser = Util.handler(async (event) => {
  const us: IUserService = container.resolve("UserService")
  const result = await us.read(event.pathParameters!.userId!)

  return Util.apigwResponse(result)
})

export const updateUser = Util.handler(async (event) => {
  const user = JSON.parse(event.body ?? '{}')

  const us: IUserService = container.resolve("UserService")
  await us.update(event.pathParameters!.userId!, user)

  return Util.apigwResponse()
})

export const deleteUser = Util.handler(async (event) => {
  const us: IUserService = container.resolve("UserService")
  await us.delete(event.pathParameters!.userId!)
  
  return Util.apigwResponse()
})
