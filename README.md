# User Service Challenge

AWS Serverless Stack project implementing a simple User service API backed by DynamoDB

## Info

This project is based on the [sst monorepo template](https://github.com/sst/monorepo-template).

The service has been implemented with function handlers in `packages/functions` and service/repository layers in `packages/core` wired with the TSyringe DI framework.

## Deploy

1. Prerequisites: Node 20 and configured AWS access

2. Deploy!

   ```bash
   npm install
   npx sst deploy
   ```

You can use sst live mode with `npx sst dev` instead.

## Test

From the packages/core directory, run `npm test`

## Usage

1. Deploy and note the base path for API gateway endpoints in the output, e.g.

```
https://{some-id}.execute-api.us-east-1.amazonaws.com
```

2. Create a user. Note that `userId` is expected to be provided by the client in this implementation, not auto-assigned by the service.

```
POST https://{some-id}.execute-api.us-east-1.amazonaws.com/users
Content-Type: application/json
{
   "userId": "string",
   "name": "string",
   "dob": "string",
   "emails": ["string"]
}
```

3. Read the user

```
GET https://{some-id}.execute-api.us-east-1.amazonaws.com/users/{userId}
```

4. Update the user

```
PUT https://{some-id}.execute-api.us-east-1.amazonaws.com/users/{userId}
Content-Type: application/json
{
   "userId": "string",
   "name": "string",
   "dob": "string",
   "emails": ["try-adding-more"]
}
```

5. Delete the user

```
DELETE https://{some-id}.execute-api.us-east-1.amazonaws.com/users/{userId}
```

## Future Considerations

- Validation of user info, e.g. any string is allowed for a user email. A real system may also want to implement confirmation emails.
- User table is very simple (partitioned on userId only). Depending on expected future requirements, having a sort key and possibly GSIs may be desired (e.g. unique emails per person, or this service managing other user data).
- Middleware for api layer to better handle lambda request/response/error patterns.
- Better understanding of the DI framework (or whether to use one at all).
- Fix issues with testing, e.g. had some trouble getting the jest matchers to work with the aws-sdk-client-mock lib.
