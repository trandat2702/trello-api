export const boardSocket = (socket) => {
  // Lắng nghe sự kiện kéo thả (cập nhật board) từ Client
  socket.on('FE_UPDATE_BOARD', (boardId) => {
    // Phản hồi lại cho TẤT CẢ các client khác để họ tự động fetch lại Board data mới nhất
    socket.broadcast.emit('BE_UPDATE_BOARD', boardId)
  })
}
