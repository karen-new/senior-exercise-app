const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "senior-exercise-app-user-table";


exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  //ログインしていない場合の処理
  if (event.headers.authorization !== "mtiToken") {
    response.statusCode = 401;
    response.body = JSON.stringify({
      message: "認証されていません。HeaderにTokenを指定してください",
    });

    return response;
  }

  const body = event.body ? JSON.parse(event.body) : null;

  if (!body || !body.userId) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。request bodyに必須パラメータがセットされていません。",
    });

    return response;
  }

  const { userId, password, volume } = body;
  const param = {
      TableName, 
      Key: marshall({
        userId,
      }),
      ExpressionAttributeNames: {
      "#volume": "volume",
      "#password": "password"
      },
      ExpressionAttributeValues: {
        ":password": password,
        ":volume": volume,
      },
      UpdateExpression: "SET #password = :password, #volume = :volume",
    };

  param.ExpressionAttributeValues = marshall(param.ExpressionAttributeValues);
  const command = new UpdateItemCommand(param);

  try {
    await client.send(command);
    response.body = JSON.stringify({ volume });

  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
