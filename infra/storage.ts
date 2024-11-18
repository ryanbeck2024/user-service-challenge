export const userTable = new sst.aws.Dynamo("UserTable", {
  fields: {
    userId: "string",
  },
  primaryIndex: { hashKey: "userId" },
});