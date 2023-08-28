const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
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

  const body = event.body ? JSON.parse(event.body) : null;
  
  //リクエストボディに必要な情報が渡っていない場合の処理
  if (!body || !body.userId || !body.age || !body.password) {
    console.log(body);
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。request bodyに必須パラメータがセットされていません。",
    });

    return response;
  }
  
  //DBに登録するデータを設定
  const { userId, age, password } = body;
  const param = {
    TableName,
    Item: marshall({
      userId, 
      age,
      password, 
      "exp":0, 
      "level":0,
    }),
  };

  // DBにデータを登録するコマンドを用意
  const command = new PutItemCommand(param);

  try {
    await client.send(command);
    response.statusCode = 201;
    response.body = JSON.stringify({
      userId,
      age,
      token: "mtiToken",
    });
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
