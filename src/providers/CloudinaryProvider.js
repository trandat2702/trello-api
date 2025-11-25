import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

/**
 * Tài liệu tham khảo:
 * https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud
 */

// Bước cấu hình cloudinary, sử dụng v2 - version 2
//https://console.cloudinary.com/app/c-698e3b51fe807125c87b64fc997409/image/getting-started
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// khởi tạo 1 cái function để thực hiện upload file lên Cloudinary
const streamUpload = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    //Tạo một cái luồng stream upload lên Cloudinary
    const stream = cloudinaryV2.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }
      }
    )
    //Thực hiện upload cái luồng trên bằng lib streamifier
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}
export const CloudinaryProvider = { streamUpload }