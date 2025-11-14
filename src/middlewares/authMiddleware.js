import { StatusCodes } from 'http-status-codes'
import { jwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'


// Middleware này sẽ đảm nhiệm việc quan trọng: xác định cái JWT access token nhận được từ phía FE có hợp lệ không,
const isAuthorized = async (req, res, next) => {
  // lấy accessToken nằm trong request cookies phía client gửi lên - withCredentials trong file authorizedAxiosInstance.js đã giúp ta làm việc này
  const clientAccessToken = req.cookies?.accessToken


  //Nếu như cái clientAccessToken không tồn tại thì trả về lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token không tồn tại, Vui lòng đăng nhập'))
    return
  }
  try {
    //Bước 1: Thực hiện giải mã token xem nó có hợp lệ không
    const accessTokenDecoded = await jwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    //Bước 2:Quan trọng: Nếu như cái token hợp lệ, thì sẽ cần
    // phải lưu thông tin giải mã được vào cái req.jwtDecoded để sử dụng cho các tầng cần xử lý phía dưới
    req.jwtDecoded = accessTokenDecoded


    //Bước 3:Cho phép cái request đi tiếp
    next()
  }
  catch (error) {

    //Nếu cái accessToken nó bị hết hạn (expried) thì mình cần trả về một
    //cái mã lỗi 410 cho phía FE biết để gọi api refreshToken
    if (error.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Token hết hạn, Vui lòng gọi lại api refresh token'))
      return
    }
    //Nếu như cái accessToken nó không hợp lệ do bất kỳ điều j khác vụ hết
    //hạn thì chúng ta cứ thẳng tay trả về mã 401 cho phía FE gọi api đăng xuất luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED!!'))
  }

}
export const authMiddleware = { isAuthorized }