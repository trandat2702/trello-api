/* eslint-disable no-console */

import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'
import cookieParser from 'cookie-parser'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
// Xử lý socket real-time với gói socket.io
// https://socket.io/get-started/chat/#integrating-socketio
import http from 'http'
import socketIo from 'socket.io'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket'
const START_SERVER = () => {
  const app = express()
  //Fix cái vụ Cache from disk của Express
  //https://stackoverflow.com/questions/22632593/how-to-disable-webpage-caching-in-expressjs-nodejs/53240717#53240717
  //Không dùng cái này thì khi FE gọi API mà BE trả về dữ liệu cũ từ cache
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  //Cấu hình cookie-parser middleware, không có thì lúc be đọc req gửi lên thì req.cookies = undefined
  app.use(cookieParser())
  //Xử lý CORS
  app.use(cors(corsOptions)) //Cho phép tất cả các nguồn (origin) truy cập API
  //Enable req.body json data
  app.use(express.json())
  //Mount our router to /v1
  app.use('/v1', APIs_V1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)
  // Tạo một cái server mới bọc thằng app của express để làm real-time với socket.io
  const server = http.createServer(app)
  // Khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    // Gọi các socket tùy theo tính năng ở đây.
    inviteUserToBoardSocket(socket)

    // ...vv
  })

  //Môi trường production
  if (env.BUILD_MODE === 'production') {
    // Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Production , I am running at Port:${process.env.PORT}`)
    })
  }
  //Môi trường development
  // Dùng server.listen thay vì app.listen vì lúc này server đã bao gồm express app và đã config socket.io
  else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(`Development , I am running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`)
    })
  }

  //Gói thư viện chúng ta sẽ dùng cho việc Cleanup truoc khi dừng Server
  //https://www.npmjs.com/package/async-exit-hook
  exitHook(() => {
    console.log('4. Đang ngắt kết nối tới MongoDB Cloud Atlas...')
    CLOSE_DB()
    console.log('5. Đã ngắt kết nối tới MongoDB Cloud Atlas')
    process.exit()
  })
}
//chỉ kết nối tới MongoDB mà không khởi động server
//Immediately Invoked Function Expression (IIFE) (Biểu thức hàm được gọi ngay lập tức)
(async () => {
  try {
    console.log('1. Đang kết nối tới MongoDB...')
    await CONNECT_DB()
    console.log('2. Kết nối MongoDB thành công!')
    START_SERVER()
    console.log('3. START_SERVER() đã hoàn thành!')
  } catch (error) {
    console.error('❌ Kết nối MongoDB thất bại:', error)
    process.exit(1)
  }
})()
