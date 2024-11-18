import { inject, injectable } from 'tsyringe'
import { IUserRepository } from '../repository'
import { User } from '../model'
import { Util } from '../util'

export interface IUserService {
  create(user: User): Promise<User>
  read(userId: string): Promise<User>
  update(userId: string, user: User): Promise<void>
  delete(userId: string): Promise<void>
}

const MAX_USER_EMAILS = 3

@injectable()
export class UserService implements IUserService {

  constructor(@inject('UserRepository') private readonly userRepo: IUserRepository) {}

  async create(userCreate: User): Promise<User> {
    const user = this.validateUser(userCreate)
    await this.userRepo.create(user)
    return user
  }

  async read(userId: string): Promise<User> {
    return this.userRepo.read(userId)
  }

  async update(userId: string, userUpdate: User): Promise<void> {
    if (userId !== userUpdate.userId) {
      throw new Util.HttpError('Entity id mismatch.', 400)
    }

    const existingUser = await this.read(userId)
    const user = this.validateUser({
      ...userUpdate,
      emails: this.mergeUserEmails(existingUser.emails, userUpdate.emails),
    })
    
    await this.userRepo.update(user)
  }

  async delete(userId: string): Promise<void> {
    await this.userRepo.delete(userId)
  }

  /**
   * Ensure user contains required fields and no unexpected data.
   * 
   * @param user
   * @returns new user with any unknown fields removed
   */
  private validateUser(user: User): User {
    if (!user.userId) {
      throw new Util.HttpError('userId is required.', 400)
    }
    if (!user.emails) {
      user.emails = []
    }
    if (user.emails.length > MAX_USER_EMAILS) {
      throw new Util.HttpError(`User may only have ${MAX_USER_EMAILS} email addresses.`, 400)
    }
    return {
      userId: user.userId,
      name: user.name,
      dob: user.dob,
      emails: user.emails
    }
  }

  /**
   * Merge user emails on update.
   * 
   * @param existingEmails already persisted for user
   * @param updatedEmails provided in update
   * @returns list of unique emails
   */
  private mergeUserEmails(existingEmails?: string[], updatedEmails?: string[]): string[] {
    const emails: string[] = []
    for(const email of (existingEmails ?? [])) {
      const updatedIndex = (updatedEmails ?? []).findIndex(ue => ue.toLowerCase() === email.toLowerCase())
      if (updatedIndex === -1) {
        // keep any existing email not provided in update (user is not allowed to remove email address)
        emails.push(email)
      } else {
        // take the updated format of the email (i.e. allow case change)
        emails.push(updatedEmails![updatedIndex])
        updatedEmails!.splice(updatedIndex, 1)
      }
    }
    // add any other new emails
    emails.push(...(updatedEmails ?? []))
    return emails
  }
}
