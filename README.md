# ParrotKit MVP - Next.js + NeonDB

ParrotKit은 UGC 크리에이터를 위한 바이럴 콘텐츠 제작 도구입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: NeonDB (PostgreSQL)
- **ORM**: Drizzle ORM
- **Auth**: JWT + bcrypt

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 추가:

```env
# NeonDB Connection (실제 값으로 교체)
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require"

# JWT Secret (랜덤 문자열로 변경)
JWT_SECRET="your-super-secret-jwt-key"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. 데이터베이스 테이블 생성

NeonDB 콘솔에서 다음 SQL을 실행:

```sql
CREATE TABLE mvp_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  interests TEXT[],
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mvp_users_email ON mvp_users(email);
CREATE INDEX idx_mvp_users_username ON mvp_users(username);
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📱 API 엔드포인트

### 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

### 로그인
```http
POST /api/auth/signin
Content-Type: application/json

{
  "username": "username",
  "password": "password123"
}

Response:
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "interests": []
  }
}
```

### 관심사 업데이트
```http
PUT /api/interests
Authorization: Bearer {token}
Content-Type: application/json

{
  "interests": ["Meme/Trend", "Fashion", "Beauty"]
}
```

## 📂 프로젝트 구조

```
parrot-kit-mvp/
├── src/
│   ├── app/
│   │   ├── api/              # 백엔드 API Routes
│   │   │   ├── auth/
│   │   │   │   ├── signup/   # 회원가입
│   │   │   │   └── signin/   # 로그인
│   │   │   └── interests/    # 관심사 업데이트
│   │   ├── dashboard/        # 대시보드
│   │   ├── interests/        # 관심사 선택
│   │   ├── onboarding/       # 온보딩
│   │   ├── pricing/          # 요금제
│   │   ├── signin/           # 로그인
│   │   ├── signup/           # 회원가입
│   │   └── ...
│   ├── components/           # React 컴포넌트
│   │   ├── auth/            # 인증 관련 컴포넌트
│   │   └── common/          # 공통 컴포넌트
│   ├── lib/                 # 라이브러리
│   │   ├── db.ts           # NeonDB 연결
│   │   └── schema.ts       # Drizzle 스키마
│   └── types/              # TypeScript 타입
├── drizzle.config.ts       # Drizzle 설정
├── .env.local             # 환경 변수
└── package.json
```

## 🎨 주요 기능

- ✅ 회원가입 (이메일/유저네임 중복 체크)
- ✅ 로그인 (JWT 인증)
- ✅ 관심사 선택 (다중 선택)
- ✅ NeonDB 연동
- ✅ TypeScript 지원
- ✅ 모바일 최적화 UI
- ✅ Tailwind CSS

## 🔐 보안

- 비밀번호 bcrypt 해싱 (10 rounds)
- JWT 토큰 기반 인증 (7일 유효)
- API 라우트에서 토큰 검증
- SQL Injection 방지 (Drizzle ORM)

## 📝 다음 단계

1. `.env.local` 파일 생성 및 NeonDB 연결 정보 입력
2. `npm install` 실행
3. NeonDB에서 테이블 생성
4. `npm run dev` 실행

## 🐛 트러블슈팅

### 패키지 설치 오류
```bash
npm install --legacy-peer-deps
```

### NeonDB 연결 오류
- `.env.local`의 `DATABASE_URL` 확인
- NeonDB 프로젝트 활성화 확인

### 빌드 오류
```bash
rm -rf .next
npm run build
```

## 👨‍💻 개발자

박상화 (@sage)
