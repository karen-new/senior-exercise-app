const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: "ap-northeast-1" });
const TableName = "senior-exercise-app-exercise-table";

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
  
  const param = {
    TableName,
  };

  const command = new ScanCommand(param);

  //ScanCommandの実行でDBからデータを取得
  try {
    const exercises = (await client.send(command)).Items;
    console.log(exercises);
    if (exercises?.length === 0) {
      throw new Error("exerciseがデータベースにありません");
    } 
    else{
      const unmarshalledUsersItems = exercises.map((item) => unmarshall(item));
    }
  } catch (e) {
    if (e.message == "exerciseがデータベースにありません") {
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: e.message,
      });
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "予期せぬエラーが発生しました。",
        errorDetail: e.toString(),
      });
    }
  }

  return response;
};
