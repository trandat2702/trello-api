import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'
const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    //Có kết quả thì trả về phía client
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}
const verifyAccount = async (req, res, next) => {
  try {
    //Lấy thông tin từ service
    const verifiedUser = await userService.verifyAccount(req.body)
    //Trả về kết quả cho client
    res.status(StatusCodes.OK).json(verifiedUser)
  } catch (error) { next(error) }
}
const login = async (req, res, next) => {
  try {
    //Gọi service để xử lý đăng nhập
    const result = await userService.login(req.body)
    /**
     * Xử lý trả về httpOnly cookie cho phía trình duyệt
     * Về cái maxAge và thư viện ms: https://www.npmjs.com/package/ms
     * Đối với cái maxAge - thời gian sống của Cookie thì chúng ta sẽ để tối đa 14 ngày,
     * tuỳ dự án. Lưu ý thời gian sống của cookie khác với thời gian sống của token
      */
    //Xử lý trả về httponly cookie chứa jwt token
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true, //js sẽ k thể dùng document.cookie để lấy giá trị token
      secure: true, //chỉ được gửi qua https(có mã hoá cookie) k gửi qua http(không có mã hoá cookie)
      sameSite: 'none', //cookie gửi được mọi request kể cả khác domain
      maxAge: ms('14d') //thời gian sống của cookie là 14 ngày
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true, //js sẽ k thể dùng document.cookie để lấy giá trị token
      secure: true, //chỉ được gửi qua https(có mã hoá cookie) k gửi qua http(không có mã hoá cookie)
      sameSite: 'none', //cookie gửi được mọi request kể cả khác domain
      maxAge: ms('14d') //thời gian sống của cookie là 14 ngày
    })
    //Trả về kết quả cho client
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const loginWithGoogle = async (req, res, next) => {
  try {
    const { googleToken } = req.body

    const result = await userService.loginWithGoogle(googleToken)

    // Set cookies giống login thường
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14d')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14d')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}
const logout = async (req, res, next) => {
  try {
    // Xóa cookie - đơn giản là làm ngược lại so với việc gán cookie ở hàm login
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)

    // Trả về một cái cookie accessToken mới sau khi đã refresh thành công
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (Error from refresh Token)'))
  }
}
const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const userAvatarFile = req.file
    // console.log('🚀 ~ update ~ userAvatarFile:', userAvatarFile)
    const updatedUser = await userService.update(userId, req.body, userAvatarFile)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) { next(error) }
}
export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update,
  loginWithGoogle
}