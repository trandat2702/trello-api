import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './config/environment.js'

//https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/#connection-guide
//Khởi tạo một đối tượng trelloDatabase ban đầu là null (chưa kết nối)
let trelloDatabase = null
const mongoClient = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})
//Hàm kết nối đến MongoDB và trả về đối tượng trelloDatabase
export const CONNECT_DB = async () => {
  //gỌI KẾT NỐI TỚI mONGODB atlas với URI đã khai báo trong thân của mongoClient
  await mongoClient.connect()
  //Lấy đối tượng cơ sở dữ liệu có tên là trello-api từ MongoDB
  trelloDatabase = mongoClient.db(env.DATABASE_NAME)
}

// Function Get_DB (không async) này có nhiệm vụ export ra cái trello database sau khi connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code
//Lưu ý phải đảm bảo chỉ luôn gọi cái GET_DB này sau khi đã gọi CONNECT_DB thành công
export const GET_DB = () => {
  //nếu chưa kết nối thì ném lỗi
  if (!trelloDatabase) {
    throw new Error('You must connect to database first!')
  }
  //nếu đã kết nối thì trả về đối tượng trelloDatabase
  return trelloDatabase
}

//Đóng kết nối với Database khi cần
export const CLOSE_DB = async () => {
  // eslint-disable-next-line no-console
  console.log('chay vao close_db')
  await mongoClient.close()
}