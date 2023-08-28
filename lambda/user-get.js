const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
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

  //見たいユーザのuserId
  const userId = event.queryStringParameters.userId; 
  
  if (!userId) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。クエリストリングに必須パラメータがセットされていません。",
    });
    return response;
  }

  const param = {
    TableName,
    Key: marshall({
      userId,
    }),
  };

  const command = new GetItemCommand(param);

  try {
    const user = (await client.send(command)).Item;
    if (!user) {
      throw new Error("指定されたuserIdを持つuserは見つかりません");
    }
    //レスポンスボディに渡す情報からパスワードを削除
    delete user.password;

    response.body = JSON.stringify(unmarshall(user));
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
