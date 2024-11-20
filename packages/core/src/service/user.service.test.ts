import 'reflect-metadata' // FIXME vitest setup
import { describe, beforeEach, expect, test, vi, afterEach } from "vitest"
import { IUserRepository } from '../repository'
import { User } from '../model'
import { IUserService, UserService } from "."

describe('UserService', () => {
  let userService: IUserService
  let userRepo: IUserRepository

  beforeEach(() => {
    userRepo = {} as IUserRepository
    userService = new UserService(userRepo)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("create writes expected fields", async () => {
    userRepo.create = vi.fn().mockResolvedValue(undefined)

    await userService.create({
      userId: '123',
      name: 'name',
      dob: 'dob',
      emails: ['1'],
      unexpectedField: 'something',
    } as User)

    expect(userRepo.create).toHaveBeenCalledWith({
      userId: '123',
      name: 'name',
      dob: 'dob',
      emails: ['1'],
    })
  })

  test("create rejects if no userId", async () => {
    userRepo.create = vi.fn().mockResolvedValue(undefined)

    await expect(userService.create({
      userId: undefined!
    })).rejects.toThrow('userId is required')

    expect(userRepo.create).not.toHaveBeenCalled()
  })

  test("create rejects too many emails", async () => {
    userRepo.create = vi.fn().mockResolvedValue(undefined)

    await expect(userService.create({
      userId: '123',
      emails: ['1','2','3','4']
    })).rejects.toThrow('User may only have 3 email addresses')

    expect(userRepo.create).not.toHaveBeenCalled()
  })

  test("reads from repo", async () => {
    userRepo.read = vi.fn().mockResolvedValue({userId: '123'})

    const result = await userService.read('123')

    expect(userRepo.read).toHaveBeenCalledWith('123')
    expect(result).toEqual({userId: '123'})
  })

  test("updates user", async () => {
    userRepo.read = vi.fn().mockResolvedValue({userId: '123', name: 'old', dob: 'old'})
    userRepo.update = vi.fn().mockResolvedValue(undefined)

    await userService.update('123', {userId: '123', name: 'new', dob: 'new'})

    expect(userRepo.update).toHaveBeenCalledWith({
      userId: '123',
      name: 'new',
      dob: 'new',
      emails: [],
    })
  })

  test("update keeps existing emails", async () => {
    userRepo.read = vi.fn().mockResolvedValue({userId: '123', emails: ['old']})
    userRepo.update = vi.fn().mockResolvedValue(undefined)

    await userService.update('123', {userId: '123'})

    expect(userRepo.update).toHaveBeenCalledWith({
      userId: '123',
      emails: ['old'],
    })
  })

  test("update adds to and updates emails", async () => {
    userRepo.read = vi.fn().mockResolvedValue({userId: '123', emails: ['old']})
    userRepo.update = vi.fn().mockResolvedValue(undefined)

    await userService.update('123', {userId: '123', emails: ['new', 'OLD']})

    expect(userRepo.update).toHaveBeenCalledWith({
      userId: '123',
      emails: ['OLD', 'new'],
    })
  })

  test("update rejects on too many emails", async () => {
    userRepo.read = vi.fn().mockResolvedValue({userId: '123', emails: ['1']})
    userRepo.update = vi.fn().mockResolvedValue(undefined)

    await expect(userService.update('123', {
      userId: '123',
      emails: ['2','3','4'] // 1st from persisted value
    })).rejects.toThrow('User may only have 3 email addresses')

    expect(userRepo.update).not.toHaveBeenCalled()
  })  

  test("deletes from repo", async () => {
    userRepo.delete = vi.fn().mockResolvedValue(undefined)

    await userService.delete('123')

    expect(userRepo.delete).toHaveBeenCalledWith('123')
  })
})
