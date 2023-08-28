const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");
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

  const param = {
    TableName,
  };

  const command = new ScanCommand(param);

  try {
    const users = (await client.send(command)).Items;
    if (users.length == 0) {
      response.body = JSON.stringify({ users: [] });
    } else {
      users.forEach((item) => delete item?.password);
      const unmarshalledUsersItems = users.map((item) => unmarshall(item));
      response.body = JSON.stringify({ users: unmarshalledUsersItems });
    }
  } catch (e) {
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString(),
    });
  }

  return response;
};
