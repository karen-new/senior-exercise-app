const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
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

  const exerciseId = event.queryStringParameters?.exerciseId;
  
  //リクエストボディに必要な情報が渡っていない場合の処理
  if (!exerciseId) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。クエリストリングに必須パラメータがセットされていません。",
    });

    return response;
  }
  
  const body = JSON.parse(event.body);
  const exerciseId = body.exerciseId;
  const param = {
    TableName,
    Key: marshall({
      exerciseId,
    }),
  };

  const command = new GetItemCommand(param);

  //GetItemCommandの実行でDBからデータを取得
  try {
    const exercise = (await client.send(command)).Item;
    if (!exercise) {
      throw new Error("指定されたuserIdを持つuserは見つかりません");
    }

    response.body = JSON.stringify(unmarshall(exercise));
  } catch (e) {
    if (e.message == "指定されたuserIdを持つuserは見つかりません") {
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
