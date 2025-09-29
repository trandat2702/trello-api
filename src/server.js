/* eslint-disable no-console */

import express from 'express'
import { CONNECT_DB, GET_DB } from './config/mongodb.js'
const START_SERVER = () => {
  const app = express()

  const hostname = 'localhost'
  const port = 8017

  app.get('/', async (req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello , I am running at http://${hostname}:${port}/`)
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


// // chỉ khi kết nối DB thành công mới khởi động server
// console.log('Đang kết nối tới MongoDB...')
// CONNECT_DB()
//   .then(() => console.log('Kết nối MongoDB thành công!'))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     console.error('Kết nối MongoDB thất bại:', error)
//     process.exit(0)
//   })


