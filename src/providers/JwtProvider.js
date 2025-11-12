//https://www.npmjs.com/package/jsonwebtoken
import JWT from 'jsonwebtoken'

//function tạo mới một token Cần 3 tham số đầu vào
//userInfo: Những thông tin muốn đính kèm vào token
//secretSignature: Chứ ký bí mật (dạng một chuỗi string ngẫu nhiên) trên docs thì để tên là privateKey tuỳ đều được, để trong biến môi trường
//tokenLife: Thời gian sống của token
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //hàm sign() của thư viện Jwt - Thuật toán mặc định HS256
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  }
  catch (error) { throw new Error(error) }
}

//Function kiểm tra một token có hợp lệ hay không
//Hợp lệ ở đây hiểu đơn giản là cái token được tạo ra có đúng với cái chữ kí bí mật secretSignature trong dự án hay không
const verifyToken = async (token, secretSignature) => {
  try {
    //
    return JWT.verify(token, secretSignature)
  }
  catch (error) { throw new Error(error) }
}
export const jwtProvider = {
  generateToken,
  verifyToken
}