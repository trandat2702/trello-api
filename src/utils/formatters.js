import { pick } from 'lodash'
export const slugify = (val) => {
  if (!val) return ''
  return String(val)
    .normalize('NFKD') //tách ký tự có dấu thành ký tự gốc + dấu riêng biệt.
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu sắc, huyền, hỏi, ngã, nặng...
    .trim() //Xóa khoảng trắng ở đầu và cuối chuỗi.
    .toLowerCase() // Chuyển toàn bộ sang chữ thường để URL đồng nhất
    .replace(/[^a-z0-9 -]/g, '') // Giữ lại chỉ chữ cái a–z, số 0–9, khoảng trắng và dấu “-”.
    .replace(/\s+/g, '-') // Thay tất cả khoảng trắng (space, tab, …) bằng dấu gạch ngang (-).
    .replace(/-+/g, '-') // loại bỏ dấu gạch ngang liên tiếp
}
// Lấy một vài dữ liệu cụ thể trong User để tránh việc trả về các dữ liệu nhạy cảm như hash password
export const pickUser = (user) => {
  if (!user) return {}
  return pick(user, ['_id', 'email', 'username', 'displayName', 'avatar', 'role', 'isActive', 'createdAt', 'updatedAt'])
}