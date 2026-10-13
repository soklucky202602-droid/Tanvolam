# Tanvolam API

Backend tối thiểu tương thích với client trong `site/`.

## Chạy local

```bash
cd backend
npm install
npm start
```

API mặc định chạy ở `http://localhost:10000`.

## Render Web Service

- Repository: `soklucky202602-droid/Tanvolam`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Node

Khuyến nghị đặt:

- `NODE_ENV=production`
- `SERVER_OPEN=true` khi muốn mở server ngay
- `SIMBOT_ENABLED=true` hoặc `false`
- `GIFTCODES_JSON` nếu muốn thay danh sách giftcode mặc định
- `DATA_DIR=/var/data` nếu gắn Persistent Disk tại `/var/data`

## API đã hỗ trợ

- `GET /api/health`
- `GET /api/public/simbot-status`
- `GET /api/public/server-open`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/game/state`
- `PUT /api/game/state` với optimistic revision
- `GET /api/ranking`
- `POST /api/world/presence`
- `POST /api/gift-codes/redeem`
- `POST /api/gift-codes/choose`

## Lưu dữ liệu

Backend dùng JSON để có thể chạy ngay không cần cài database. Trên Render, filesystem của Web Service không nên dùng cho dữ liệu lâu dài nếu không có Persistent Disk. Khi triển khai thật, nên chuyển lớp lưu trữ sang PostgreSQL/Supabase hoặc gắn Persistent Disk.
