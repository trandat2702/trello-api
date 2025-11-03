//Những domain được phép truy cập tới tài nguyên của Server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'
  // //Không cần localhost vì ở file
  // config/cors.js chúng ta đã luôn luôn cho phép môi trường dev truy cập rồi
]
export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}