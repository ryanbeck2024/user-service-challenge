import { Context, APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyResultV2 } from "aws-lambda";

export namespace Util {
  export function handler(
    lambda: (evt: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResultV2>
  ) {
    return async function(event: APIGatewayProxyEvent, context: Context) {
      try {
        const result = await lambda(event, context);
        return result
      } catch (error) {
        const statusCode = error instanceof HttpError ? error.statusCode : 500
        return apigwResponse({
          error: true,
          message: error instanceof Error ? error.message : String(error)
        }, undefined, statusCode)
      }
    }
  }

  export function apigwResponse(
    response?: unknown,
    headers?: Record<string, boolean | number | string>,
    statusCode = 200,
  ): APIGatewayProxyResultV2 {
    return {
        body: response != null ? JSON.stringify(response) : '',
        statusCode,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...headers,
        },
    }
  }

  export class HttpError extends Error {
    public statusCode: number
    constructor(message: string, statusCode: number) {
      super(message)
      this.statusCode = statusCode
    }
  }
}
