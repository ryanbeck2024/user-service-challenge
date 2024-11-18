import { userTable } from "./storage";

export const userApi = new sst.aws.ApiGatewayV2("UserApi", {
  transform: {
    route: {
      handler: {
        link: [userTable],
      },
    }
  }
});

userApi.route("POST /users", "packages/functions/src/users.createUser");
userApi.route("GET /users/{userId}", "packages/functions/src/users.readUser");
userApi.route("PUT /users/{userId}", "packages/functions/src/users.updateUser");
userApi.route("DELETE /users/{userId}", "packages/functions/src/users.deleteUser");