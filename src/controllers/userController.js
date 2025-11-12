import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
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
    const loggedInUser = await userService.login(req.body)

    //Xử lý trả về httponlt cookie chứa jwt token
    //Trả về kết quả cho client
    res.status(StatusCodes.OK).json(loggedInUser)
  } catch (error) { next(error) }
}

export const userController = {
  createNew,
  verifyAccount,
  login
}