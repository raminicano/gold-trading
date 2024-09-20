# gold-trading

🛠️ 구현중

## 디렉토리 구조

### 인증서버

```
auth-server/
├── prisma/
│       └── schema.prisma               # prisma 스키마 정의
├── generated/                          # proto파일 컴파일을 통해 나온 stub
|       └── auth.ts
├── src/
│   ├── auth/
│   │   ├── grpc/
│   │   │   └── auth.proto              # gRPC 프로토콜 정의 파일 (자원 서버와 통신)
│   │   │   └── auth-grpc.service.ts    # gRPC 서비스 구현 (자원 서버에서 요청 처리)
│   │   ├── services/
│   │   │   └── auth.service.ts         # 토큰 생성, 인증 로직
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
│   ├── prisma/
│   │   └── prisma.service.ts           # prisma 서비스 (데이터베이스 연결 및 접근 관리)
│   ├── main.ts                         # NestJS entry point
│   └── app.module.ts                   # 모듈 정의 (Elastic Stack, Metricbeat 포함)
├── test/                               # 테스트 폴더
│   ├── auth-grpc.service.spec.ts       # gRPC 서비스 테스트
│   └── user.service.spec.ts            # 사용자 서비스 테스트
├── package.json
└── nest-cli.json

```

### 자원서버

```
resource-server/
├── prisma/
│       └── schema.prisma               # prisma 스키마 정의
├── src/
│   ├── orders/
│   │   ├── controllers/
│   │   │   └── order.controller.ts      # 주문 관련 REST API 컨트롤러 (생성, 조회, 수정, 삭제)
│   │   ├── services/
│   │   │   └── order.service.ts         # 주문 관련 비즈니스 로직
│   │   └── dto/
│   │       └── createOrder.dto.ts      # 주문 생성 관련 DTO
│   │       └── updateOrder.dto.ts      # 주문 수정 관련 DTO
│   ├── auth/
│   │   ├── grpc/
│   │   │   └── auth-grpc.service.ts     # gRPC 클라이언트 (인증 서버에 인증 요청)
│   │   └── guards/
│   │       └── jwt.guard.ts             # JWT 인증 관련 Guard (클라이언트에서 요청된 JWT 검증)
│   ├── users/
│   │   ├── controllers/
│   │   │   └── user.controller.ts       # 사용자 관련 REST API 컨트롤러 (회원가입, 정보 수정, 로그아웃)
│   │   ├── services/
│   │   │   └── user.service.ts          # 사용자 정보 관리 비즈니스 로직
│   │   └── dto/
│   │       └── createUser.dto.ts        # 회원가입 관련 DTO
│   │       └── updateUser.dto.ts        # 사용자 정보 수정 관련 DTO
│   ├── logging/                         # 로그 관련 모듈
│   │   ├── elastic-logger.service.ts    # Elastic Stack과 연동하여 로그 기록 (로그인, 로그아웃, 주문 관련 로그)
│   │   └── log.constants.ts             # 로그 관련 상수 및 설정
│   ├── config/                          # 환경 설정
│   │   ├── database.config.ts           # 데이터베이스 설정 (MariaDB 또는 PostgreSQL)
│   │   ├── elastic.config.ts            # Elastic Stack 설정
│   │   └── app.config.ts                # 애플리케이션 기본 설정
│   ├── metric/
│   │   └── metricbeat.service.ts        # Metricbeat 설정 및 컴퓨터 사용률 모니터링
│   ├── prisma/
│   │   └── prisma.service.ts            # prisma 서비스 (데이터베이스 연결 및 접근 관리)
│   ├── main.ts                          # NestJS entry point
│   └── app.module.ts                    # 모듈 정의 (Elastic Stack, Metricbeat 포함)
├── test/                                # 테스트 폴더
│   ├── order.service.spec.ts            # 주문 서비스 테스트
│   ├── user.service.spec.ts             # 사용자 서비스 테스트
│   └── auth-grpc.service.spec.ts        # gRPC 서비스 테스트
├── package.json
└── nest-cli.json

```
