# AI Learning Hub - Production-Ready Platform

A complete AI-powered learning platform for Ghanaian JHS & SHS students, aligned with the Ghana Education Service (GES) syllabus.

## 🎯 Features

- **AI Homework Solver**: Step-by-step solutions aligned with GES syllabus
- **Voice Learning Assistant**: Natural voice explanations with Ghanaian accent support
- **Progress Tracking**: Comprehensive analytics and performance monitoring
- **Multiple Subjects**: Mathematics, English, Social Studies, History, Creative Arts, Computing, and more
- **BECE & WASSCE Prep**: Exam-focused learning and practice
- **Mobile-First**: Responsive design for all devices

## 🛠 Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- Framer Motion
- React Router
- Axios
- Recharts

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- OpenAI API
- ElevenLabs API (Text-to-Speech)

### DevOps
- Docker + Docker Compose
- Nginx
- Environment-based configuration

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Docker & Docker Compose (for containerized deployment)
- OpenAI API key
- ElevenLabs API key (for voice features)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-learning-hub
```

2. **Set up Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your API keys
npx prisma generate
npx prisma migrate dev
npm run dev
```

3. **Set up Frontend**
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Docker Deployment

1. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

2. **Build and run with Docker Compose**
```bash
docker-compose up --build -d
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

4. **Stop the application**
```bash
docker-compose down
```

## 🔑 API Keys Setup

### OpenAI API
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env` as `OPENAI_API_KEY`

### ElevenLabs API
1. Go to https://elevenlabs.io
2. Create account and get API key
3. Add to `.env` as `ELEVENLABS_API_KEY`

## 📁 Project Structure

```
ai-learning-hub/
├── server/                 # Backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── ai/           # AI services
│   │   ├── middleware/   # Auth, error handling
│   │   └── utils/        # Utilities
│   ├── prisma/           # Database schema
│   └── package.json
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React context
│   │   └── App.jsx
│   └── package.json
└── docker-compose.yml   # Docker orchestration
```

## 🎓 Supported Subjects

### JHS (Junior High School)
- Mathematics
- English Language
- Social Studies
- History
- Creative Arts
- Computing

### SHS (Senior High School)
- Core Mathematics
- English Language
- Social Studies
- History
- Economics
- Science (Biology, Chemistry, Physics)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet.js security headers
- CORS protection
- SQL injection prevention (Prisma ORM)
- Environment variable management

## 📊 Database Schema

- **Students**: User accounts and profiles
- **Subjects**: GES syllabus-aligned subjects
- **Questions**: Student queries and AI responses
- **Progress**: Performance tracking and analytics

## 🚀 Production Deployment

### Environment Variables

Ensure all required environment variables are set:

**Backend (.env in server/)**
```env
DATABASE_URL=postgresql://user:password@host:5432/ai_learning_hub
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
CLIENT_URL=https://yourdomain.com
```

**Frontend (.env in client/)**
```env
VITE_API_URL=https://api.yourdomain.com
```

### Deployment Steps

1. Build frontend: `npm run build`
2. Set up PostgreSQL database
3. Run migrations: `npx prisma migrate deploy`
4. Start backend: `npm start`
5. Serve frontend with Nginx/Apache
6. Configure SSL certificates
7. Set up monitoring and logging

## 🤝 Contributing

This is a production educational platform. Contributions should maintain:
- Code quality and documentation
- GES syllabus accuracy
- Student data privacy
- Performance standards

## 📝 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions:
- Email: support@ailearninghub.com
- Documentation: https://docs.ailearninghub.com

## 🎯 Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] Offline mode support
- [ ] Peer-to-peer study groups
- [ ] Teacher dashboard
- [ ] Parent monitoring portal
- [ ] Gamification and rewards
- [ ] Video lessons integration
- [ ] Past questions database

---

**Made with ❤️ for Ghanaian students**
