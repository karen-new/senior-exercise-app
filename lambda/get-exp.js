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

  //リクエストボディに必要な情報が渡っていない場合の処理
  const body = event.body ? JSON.parse(event.body) : null;
  if (!body || !body.userId || !body.exp) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。request bodyに必須パラメータがセットされていません。",
    });

    return response;
  }

  //DBの更新する経験値を設定
  const { userId,exp } = JSON.parse(event.body);
 
  const param = {
    TableName, 
    Key: marshall({
      userId,
    }),
    ExpressionAttributeNames: {
      "#exp": "exp",
    },
    ExpressionAttributeValues: {
      ":exp": exp,
    },
    UpdateExpression: "SET #exp = :exp",

  };
  
  param.ExpressionAttributeValues = marshall(param.ExpressionAttributeValues)
  
  // DBのデータを更新するコマンドを用意
  const command = new UpdateItemCommand(param);
  
  try{
    await client.send(command);
    response.body = JSON.stringify({userId, exp});
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};



