# AI INTERVIEW

Starter project for an AI-powered interview practice dashboard.

## Stack
- Frontend: React, Vite, Tailwind CSS v4, Recharts, Lucide React, Axios
- Backend: FastAPI, SQLAlchemy, PyMySQL
- Database: MySQL

## 1. Create MySQL database

Run in MySQL Workbench:

```sql
CREATE DATABASE ai_interview
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

## 2. Start backend

Open terminal in `backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy `.env.example` to `.env`, then fill in your MySQL password.

```powershell
uvicorn main:app --reload
```

API docs: http://127.0.0.1:8000/docs
Connection test: http://127.0.0.1:8000/test-connection

## 3. Start frontend

Open another terminal in `frontend`:

```powershell
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:5173

## API routes
- `GET /api/dashboard`
- `GET /api/interviews`
- `POST /api/interviews`
- `GET /api/interviews/{id}`
- `PATCH /api/interviews/{id}`
- `DELETE /api/interviews/{id}`

The current project provides the dashboard and interview CRUD workflow. Actual AI question generation, speech recognition, and AI evaluation require integration with an AI provider and audio/video services.


## Cập nhật chức năng phòng phỏng vấn

- Bổ sung lựa chọn 3 câu hỏi (cùng với 5, 10, 15, 20).
- Backend chấp nhận số lượng câu hỏi từ 3 đến 20.
- Khi tạo buổi phỏng vấn, trạng thái được cập nhật thành `in_progress`.
- Khi ứng viên trả lời câu hỏi cuối cùng, trạng thái được cập nhật thành `completed`.
- Giao diện chat vẫn dùng bộ câu hỏi mẫu có sẵn trong `frontend/src/App.jsx`; chưa tích hợp mô hình AI sinh câu hỏi hoặc chấm điểm tự động.

### Chạy dự án

Backend: mở Terminal tại thư mục `backend`, kích hoạt môi trường ảo, cài thư viện nếu cần và chạy:

```powershell
uvicorn main:app --reload
```

Frontend: mở Terminal mới tại thư mục `frontend` và chạy:

```powershell
npm install
npm run dev
```

Cấu hình MySQL trong `backend/.env` theo thông tin máy của bạn. Không chia sẻ file `.env` có chứa mật khẩu.
