// import ApiError from "~/utils/ApiError"
import { slugify } from '~/utils/formatters'
const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    //Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    //Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    //...
    //làm thêm các xử lý logic khác với Collection liên quan
    //Bắn email,notification về cho addmin,thành viên,...
    //Trả về kết quả ,trong Service trả về gì thì Controller nhận được cái đó ,nếu k sẽ bị lỗi
    return newBoard
  } catch (error) {
    throw error
  }
}
export const boardService = {
  createNew
}