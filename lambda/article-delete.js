const { DynamoDBClient, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "senior-exercise-app-article-table";

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

  //DBから削除するデータを設定
  const userId = event.queryStringParameters?.userId;
  const timestamp = Number(event.queryStringParameters?.timestamp);
  const param = {
    TableName,
    "Key":marshall({
      userId,
      timestamp
    }),
  };

  // データを削除するコマンドを用意
  const command = new DeleteItemCommand(param);

  try {
    await client.send(command);
    response.statusCode=204;
    response.body=JSON.stringify({message:""})
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
