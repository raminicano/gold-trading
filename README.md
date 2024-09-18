# gold-trading

🛠️ 구현중

## 디렉토리 구조

### 인증서버

```
auth-server/
├── src/
│   ├── auth/
│   │   ├── grpc/
│   │   │   └── auth.proto              # gRPC 프로토콜 정의 파일 (자원 서버와 통신)
│   │   │   └── auth-grpc.service.ts    # gRPC 서비스 구현 (자원 서버에서 요청 처리)
│   │   ├── services/
│   │   │   └── auth.service.ts         # 토큰 생성, 인증 로직
│   │   ├── dto/
│   │   │   └── create-user.dto.ts      # 회원가입 관련 DTO
│   │   │   └── login.dto.ts            # 로그인 관련 DTO
│   │   ├── guards/
│   │   │   └── jwt.guard.ts            # JWT 관련 인증 및 토큰 처리
│   ├── users/
│   │   ├── services/
│   │   │   └── user.service.ts         # 사용자 데이터 관리
│   ├── logging/                        # 로그 관련 모듈
│   │   ├── elastic-logger.service.ts   # Elastic Stack과 연동하여 로그 기록 (로그아웃, 로그인 등)
│   │   └── log.constants.ts            # 로그 관련 상수 및 설정
│   ├── config/                         # 환경 설정
│   │   ├── database.config.ts          # MariaDB 및 데이터베이스 설정
│   │   ├── grpc.config.ts              # gRPC 관련 설정
│   │   ├── elastic.config.ts           # Elastic Stack 설정
│   │   └── app.config.ts               # 애플리케이션 기본 설정
│   ├── metric/
│   │   └── metricbeat.service.ts       # Metricbeat 설정 및 컴퓨터 사용률 모니터링
│   ├── database/
│   │   └── entities/
│   │       └── user.entity.ts          # 사용자 정보 엔터티 (MariaDB 사용)
│   │   └── repositories/
│   │       └── user.repository.ts      # 사용자 데이터베이스 접근 레이어
│   ├── main.ts                         # NestJS entry point
│   └── app.module.ts                   # 모듈 정의 (Elastic Stack, Metricbeat 포함)
├── test/                               # 테스트 폴더
│   ├── auth-grpc.service.spec.ts       # gRPC 서비스 테스트
│   └── user.service.spec.ts            # 사용자 서비스 테스트
├── package.json
└── nest-cli.json

```
