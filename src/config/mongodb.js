import { MongoClient, ServerApiVersion } from 'mongodb'
//KdybmpitxtYAK0YH
//dat27022004
const MONGO_URI = 'mongodb+srv://dat27022004:KdybmpitxtYAK0YH@cluster0-trello.msioebd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-trello'
const DB_NAME = 'trello-api'

//https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/#connection-guide
//Khởi tạo một đối tượng trelloDatabase ban đầu là null (chưa kết nối)
let trelloDatabase = null
const mongoClient = new MongoClient(MONGO_URI, {
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
  trelloDatabase = mongoClient.db(DB_NAME)
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