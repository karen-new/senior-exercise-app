const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
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

 
  const body = event.body ? JSON.parse(event.body) : null;
  
  //リクエストボディに必要な情報が渡っていない場合の処理
  if (!body || !body.userId || !body.text){
    response.statusCode = 400;
    response.body = JSON.stringify({
      message : "無効なリクエストです。request bodyに必須パラメータがセットされていません。"
      })
    return response;
  }
 
  //DBに登録するデータを設定
  const { userId, text } = body;
  const timestamp = Date.now();
  const param = {
    TableName, 
    Item: marshall({
      userId, 
      text, 
      timestamp,
    }),
  };
 
  // DBにデータを登録するコマンドを用意
  const command = new PutItemCommand(param);
 
  try {
    await client.send(command);
    response.statusCode = 200;
    response.body = JSON.stringify({userId,text,timestamp});
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }
 
  return response;
};