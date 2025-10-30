E-Learning Platform – Backend

Node.js + Express + MongoDB (Mongoose)

- API Base URL: `http://localhost:5000/api`
- Node 18+

Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

If `.env.example` is missing, create `.env` with:

```
MONGO_URI=mongodb://localhost:27017/elearning
PORT=5000
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SEED_TEACHER_EMAIL=teacher@elearn.local
SEED_TEACHER_PASSWORD=Teacher@123
SEED_STUDENT_EMAIL=student@elearn.local
SEED_STUDENT_PASSWORD=Student@123
FRONTEND_URL=http://localhost:5173
```

Scripts

- npm run dev – start with nodemon
- npm start – start server
- npm run seed – seed DB

API Routes (base `/api`)

Auth `/api/auth`
- POST /register → `{ name, email, password, role }`
- POST /login → `{ email, password, role }`
- GET /me (auth)

Teachers `/api/teachers`
- GET / → all teachers
- GET /:id → teacher + courses
- PUT /:id (auth: self)

Students `/api/students`
- GET /:id (auth: self)
- PUT /:id (auth: self)
- POST /:id/enroll/:courseId (auth: self)

Courses `/api/courses`
- GET / → list (filters: category, search, teacherId)
- GET /:id → details
- POST / (auth: teacher) → create
- PUT /:id (auth: teacher owner) → update
- DELETE /:id (auth: teacher owner) → delete
- POST /:id/lessons (auth: teacher owner) → add lesson
- POST /:id/feedback (auth: student) → add feedback

Sample Requests

Login teacher
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"teacher@elearn.local","password":"Teacher@123","role":"teacher"}'
```

Create course
```bash
curl -X POST http://localhost:5000/api/courses \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"New Course","description":"Desc","category":"General","price":10}'
```

Enroll student
```bash
curl -X POST http://localhost:5000/api/students/<STUDENT_ID>/enroll/<COURSE_ID> \
  -H 'Authorization: Bearer <TOKEN>'
```

Add feedback
```bash
curl -X POST http://localhost:5000/api/courses/<COURSE_ID>/feedback \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"rating":5, "comment":"Great!"}'
```

Troubleshooting

- Ensure MongoDB is running at `mongodb://localhost:27017`
- Set a strong `JWT_SECRET`
- Verify `FRONTEND_URL` matches your frontend origin for CORS
- Without Cloudinary, uploads store locally in `uploads/`


