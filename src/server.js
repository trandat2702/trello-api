/* eslint-disable no-console */

import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
const START_SERVER = () => {
  const app = express()
  //Xử lý CORS
  app.use(cors(corsOptions)) //Cho phép tất cả các nguồn (origin) truy cập API
  //Enable req.body json data
  app.use(express.json())
  //Mount our router to /v1
  app.use('/v1', APIs_V1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  //Môi trường production
  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Production , I am running at Port:${process.env.PORT}`)
    })
  }
  //Môi trường development
  else {
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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
