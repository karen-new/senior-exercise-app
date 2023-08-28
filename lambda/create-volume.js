const { DynamoDBClient, PutItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
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

  //リクエストボディに必要な情報が渡っていない場合の処理
  const body = event.body ? JSON.parse(event.body) : null;
  if (!body ||!body.userId || !body.volume) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message:
        "無効なリクエストです。request bodyに必須パラメータがセットされていません。",
    });

    return response;
  }

  //DBに登録するvolumeのデータを設定
  const { userId, volume } = body;
  const param = {
    TableName, 
    Key: marshall({
      userId,
    }),
    ExpressionAttributeNames: {
      "#volume": "volume",
    },
    ExpressionAttributeValues: {
      ":volume": volume,
    },
    UpdateExpression: "SET #volume = :volume",

  };
  
  // DBにデータを登録するコマンドを用意
  param.ExpressionAttributeValues = marshall(param.ExpressionAttributeValues)
  
  const command = new UpdateItemCommand(param);

  try {
    await client.send(command);
    response.body = JSON.stringify({userId, volume});
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
