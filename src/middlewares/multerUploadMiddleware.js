import multer from 'multer'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
// Hầu hết những thứ bên dưới đều có ở trong docs của multer
//https://www.npmjs.com/package/multer
//tài liệu quan trọng https://techmaster.vn/posts/37742/node-js-upload-anh-voi-multer-stream-va-cloudinary
//Function kiểm tra loại file nào được chấp nhận
const cumstomeFileFilter = (req, file, callback) => {
  // console.log('🚀 ~ cumstomeFileFilter ~ file:', file)
  //Đối với thằng multer, kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  //Nếu như kiểu file hợp lệ cho qua
  return callback(null, true)
}

// Khởi tạo function multer upload được bọc bởi thằng multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE }, //Giới hạn kích thước file
  fileFilter: cumstomeFileFilter //Sử dụng hàm kiểm tra file ở trên
})

export const multerUploadMiddleware = { upload }