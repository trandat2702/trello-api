
# Trello MERN – Tài liệu Onboarding Hợp Nhất

Tài liệu này giúp người mới nắm tổng quan dự án (Web + API), hiểu luồng dữ liệu, thử nhanh các API, và chạy dự án trên máy Windows.

## 1) Dự án làm gì? (Tóm tắt 30s)

Clone tính năng cốt lõi của Trello:
- Một Board chứa nhiều Column; mỗi Column chứa nhiều Card.
- Kéo–thả Column để sắp xếp trong Board.
- Kéo–thả Card trong cùng Column hoặc giữa các Column.
- Tạo/Xóa Column, Tạo Card, cập nhật thứ tự hiển thị.

Tech chính:
- Frontend: React + Vite + Material UI + dnd-kit + Axios.
- Backend: Node.js + Express + MongoDB + Joi.

## 2) Kiến trúc & Luồng dữ liệu (ASCII)

```
┌───────── Người dùng ─────────┐
│  Trình duyệt (UI Trello Web) │
└──────────────┬───────────────┘
							 │ Click, kéo–thả (dnd-kit) → cập nhật UI lạc quan (optimistic)
							 │ Axios gọi REST API
							 ▼
				┌─────────────── Backend (trello-api) ───────────────┐
				│ Express Router (/v1)                                │
				│   └─ Routes → Controllers → Services → Models       │
				│                          │                          │
				│                          ▼                          │
				│                     MongoDB Driver                  │
				│                          │                          │
				│                          ▼                          │
				│                  Database (Boards, Columns, Cards)  │
				└─────────────────────────────────────────────────────┘
							 ▲              │
							 │ JSON         │ JSON
							 └──────────────┘

Chu trình ví dụ (kéo 1 Card sang Column khác):
1) UI cập nhật ngay để mượt (optimistic update).
2) Gửi PUT /v1/boards/supports/moving_card với danh sách orderIds mới.
3) Server cập nhật 2 Column (prev/next) + columnId của Card trong DB.
4) Trả JSON; UI đã đúng vị trí nên không bị giật.
```

## 3) Mô hình dữ liệu (đơn giản hoá)

- Board
	- title, description, type (public|private)
	- columnOrderIds: [ObjectId]
	- (chi tiết trả về kèm mảng columns)

- Column
	- boardId, title
	- cardOrderIds: [ObjectId]

- Card
	- boardId, columnId, title, (description?)

Vì sao có mảng orderIds?
- Lưu thứ tự hiển thị do người dùng sắp xếp (kéo–thả).
- Cập nhật nhanh, payload nhỏ (chỉ mảng id thay vì cả object).

## 4) Bảng Endpoint (V1)

| Method | Path                                | Mục đích                                           |
|-------:|-------------------------------------|-----------------------------------------------------|
|  GET   | /v1/boards/:id                      | Lấy chi tiết Board kèm Columns và Cards             |
|  POST  | /v1/boards                          | Tạo Board mới                                       |
|  PUT   | /v1/boards/:id                      | Cập nhật Board (ví dụ: columnOrderIds)              |
|  PUT   | /v1/boards/supports/moving_card     | Di chuyển Card giữa 2 Column                        |
|  POST  | /v1/columns                         | Tạo Column mới (đồng thời push vào columnOrderIds)  |
|  PUT   | /v1/columns/:id                     | Cập nhật Column (ví dụ: cardOrderIds)               |
| DELETE | /v1/columns/:id                     | Xoá Column + toàn bộ Cards bên trong                |
|  POST  | /v1/cards                           | Tạo Card mới (đồng thời push vào cardOrderIds)      |

### Ví dụ yêu cầu/đáp ứng

1) GET Board details

Request:
```
GET /v1/boards/68fe4cb8ea8e64741d524430
```

Response (rút gọn):
```json
{
	"_id": "68fe4cb8ea8e64741d524430",
	"title": "My Project Board",
	"description": "Board mô tả dự án",
	"type": "public",
	"columnOrderIds": ["66a1...01", "66a1...02"],
	"columns": [
		{
			"_id": "66a1...01",
			"boardId": "68fe4cb8ea8e64741d524430",
			"title": "To Do",
			"cardOrderIds": ["77b2...01", "77b2...02"],
			"cards": [
				{ "_id": "77b2...01", "boardId": "...", "columnId": "66a1...01", "title": "Task 1" },
				{ "_id": "77b2...02", "boardId": "...", "columnId": "66a1...01", "title": "Task 2" }
			]
		}
	]
}
```

2) PUT cập nhật thứ tự Column trong Board

Request:
```
PUT /v1/boards/68fe4cb8ea8e64741d524430
Content-Type: application/json
{
	"columnOrderIds": ["66a1...02", "66a1...01"]
}
```

Response (rút gọn):
```json
{
	"_id": "68fe4cb8ea8e64741d524430",
	"columnOrderIds": ["66a1...02", "66a1...01"],
	"updatedAt": 1730790000000
}
```

3) PUT di chuyển Card giữa 2 Column

Request:
```
PUT /v1/boards/supports/moving_card
Content-Type: application/json
{
	"currentCardId": "77b2...01",
	"prevColumnId": "66a1...01",
	"prevCardOrderIds": ["77b2...02"],
	"nextColumnId": "66a1...02",
	"nextCardOrderIds": ["77b2...01", "77b2...03"]
}
```

Response:
```json
{ "updateResult": "Success" }
```

4) POST tạo Column

Request:
```
POST /v1/columns
Content-Type: application/json
{
	"boardId": "68fe4cb8ea8e64741d524430",
	"title": "In Progress"
}
```

Response (rút gọn):
```json
{
	"_id": "66a1...03",
	"boardId": "68fe4cb8ea8e64741d524430",
	"title": "In Progress",
	"cardOrderIds": [],
	"cards": []
}
```

5) PUT cập nhật thứ tự Card trong 1 Column

Request:
```
PUT /v1/columns/66a1...01
Content-Type: application/json
{
	"cardOrderIds": ["77b2...02", "77b2...01", "77b2...03"]
}
```

Response (rút gọn):
```json
{
	"_id": "66a1...01",
	"cardOrderIds": ["77b2...02", "77b2...01", "77b2...03"],
	"updatedAt": 1730790000000
}
```

6) DELETE xoá Column (và toàn bộ Card bên trong)

Request:
```
DELETE /v1/columns/66a1...03
```

Response:
```json
{ "deleteResult": "Column and its cards deleted successfully" }
```

7) POST tạo Card

Request:
```
POST /v1/cards
Content-Type: application/json
{
	"boardId": "68fe4cb8ea8e64741d524430",
	"columnId": "66a1...02",
	"title": "New Task"
}
```

Response (rút gọn):
```json
{
	"_id": "77b2...09",
	"boardId": "68fe4cb8ea8e64741d524430",
	"columnId": "66a1...02",
	"title": "New Task"
}
```

> Lưu ý: Tất cả id trong ví dụ là chuỗi 24 ký tự hexa (ObjectId) và chỉ mang tính minh hoạ.

## 5) Cách chạy dự án (Windows PowerShell)

Yêu cầu:
- Node.js >= 18, Yarn 1.x
- Không commit/thông báo bí mật `.env`. Tự tạo `.env` trong `trello-api/` theo cấu trúc sau (giá trị thật do bạn tự quản):

```
MONGODB_URI='mongodb+srv://<user>:<pass>@<cluster-url>/?retryWrites=true&w=majority'
DATABASE_NAME='trello-api'
LOCAL_DEV_APP_HOST='localhost'
LOCAL_DEV_APP_PORT=8017
```

Chạy Backend (API):

```powershell
cd d:\Workspace\trello-api
yarn install
yarn dev
```

Chạy Frontend (Web):

```powershell
cd d:\Workspace\trello-web
yarn install
yarn dev
```

Mặc định Frontend sẽ gọi API theo `BUILD_MODE`:
- Dev: http://localhost:8017
- Prod: https://trello-api-3jus.onrender.com

## 6) Frontend – điều cần biết nhanh

- Trang chính: `src/pages/Boards/_id.jsx` – nạp dữ liệu Board, sắp xếp `columns` và `cards`, truyền handler xuống dưới.
- Kéo–thả: `src/pages/Boards/BoardContent/BoardContent.jsx` – cấu hình dnd-kit, xử lý `onDragStart/Over/End`.
- Thêm Column/Card: qua `ListColumns` và `Column`.
- Chặn kéo khi nhập liệu: `customLibraries/DndKitSensors.js` (dựa trên `data-no-dnd="true"`).
- Gọi API: `src/apis/index.js` (Axios) – endpoint khớp với bảng bên trên.

## 7) Lỗi & xác thực dữ liệu

- Backend sử dụng Joi để validate payload ở `src/validations/*`.
- Lỗi được gom tại `src/middlewares/errorHandlingMiddleware.js` – trong dev có kèm `stack` để debug.
- CORS: cho phép domain tin cậy (xem `src/config/cors.js` + `utils/constants.js`).

## 8) Gợi ý phát triển tiếp

- Đăng nhập/Phân quyền, nhiều Board, trang danh sách Board.
- Modal chi tiết Card (mô tả, checklist, deadline, assignees...).
- React Query + Redux Toolkit/Zustand cho state phức tạp.
- TypeScript, Unit/E2E tests, CI/CD.
- Tối ưu hiệu năng: virtualization list, code splitting, debounce search.
- Bảo mật: rate limit, Helmet, sanitize nâng cao, audit dependency.

---

Tài liệu này bao quát cả Web và API để bạn onboard nhanh: hãy bắt đầu bằng việc chạy API trước, sau đó chạy Web và mở URL Vite in ra trong terminal.
