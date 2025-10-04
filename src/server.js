/* eslint-disable no-console */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
const START_SERVER = () => {
  const app = express()
  //Enable req.body json data
  app.use(express.json())
  //Mount our router to /v1
  app.use('/v1', APIs_V1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello , I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
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
    console.log('Đang kết nối tới MongoDB...')
    await CONNECT_DB()
    console.log('Kết nối MongoDB thành công!')
    START_SERVER()
  } catch (error) {
    console.error('Kết nối MongoDB thất bại:', error)
    process.exit(0)
  }
})()
