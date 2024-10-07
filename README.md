# gold-trading

🛠️ 구현중

## 디렉토리 구조

### 인증서버

```
auth-server/
├── README.md                          # 프로젝트에 대한 설명 및 사용법 문서
├── generated/                         # proto 파일 컴파일을 통해 생성된 gRPC 관련 stub 파일
│   └── auth.ts                        # gRPC 통신을 위한 auth 서비스 stub 파일
├── nest-cli.json                      # NestJS CLI 설정 파일 (컴파일, 테스트, 빌드 관련 설정 포함)
├── package-lock.json                  # 프로젝트 의존성 버전 고정 파일
├── package.json                       # 프로젝트 의존성 및 스크립트 관리 파일
├── prisma/                            # Prisma 관련 설정 및 데이터베이스 스키마 파일
│   ├── migrations/                    # 데이터베이스 마이그레이션 파일
│   │   ├── 20241006063356_add_unique_orderid/
│   │   │   └── migration.sql          # 특정 마이그레이션에 대한 SQL 파일 (예: orderId를 고유 필드로 추가)
│   │   └── migration_lock.toml        # 마이그레이션 잠금 파일, 동시에 여러 마이그레이션 방지
│   └── schema.prisma                  # Prisma 스키마 정의 파일 (데이터베이스 모델과 관계 설정)
├── src/                               # 애플리케이션의 소스 코드
│   ├── app.controller.spec.ts         # app.controller의 유닛 테스트 파일
│   ├── app.controller.ts              # 기본 애플리케이션 컨트롤러
│   ├── app.module.ts                  # 최상위 모듈 정의 파일 (애플리케이션의 모듈을 정의)
│   ├── app.service.ts                 # 기본 애플리케이션 서비스 (비즈니스 로직 포함)
│   ├── auth/                          # 인증 관련 모듈
│   │   ├── auth.module.ts             # 인증 관련 모듈 정의 파일
│   │   ├── grpc/                      # gRPC 관련 코드
│   │   │   └── auth-grpc.controller.ts # gRPC 컨트롤러 (auth 서비스와 gRPC 통신 처리)
│   │   ├── guards/                    # 인증 관련 가드 (JWT 검증 등을 담당)
│   │   │   └── jwt.guard.ts           # JWT 토큰 검증을 위한 가드
│   │   └── services/                  # 인증 서비스 로직
│   │       └── auth.service.ts        # 토큰 생성, 인증 처리 로직
│   ├── config/                        # 애플리케이션 설정 파일
│   │   ├── app.config.ts              # 애플리케이션 기본 설정 파일
│   │   ├── database.config.ts         # 데이터베이스 설정 파일 (Prisma 및 DB 연결 관련 설정)
│   │   └── elastic.config.ts          # Elastic Stack 관련 설정 파일
│   ├── logging/                       # 로그 관련 모듈
│   │   ├── elastic-logger.service.ts  # Elastic Stack과 연동하여 로그 기록 (로그인, 로그아웃 등)
│   │   └── log.constants.ts           # 로그 관련 상수 정의 파일
│   ├── main.ts                        # 애플리케이션 엔트리 포인트 (NestJS 부트스트랩 파일)
│   ├── metric/                        # 시스템 메트릭 모니터링 모듈
│   │   └── metricbeat.service.ts      # Metricbeat 설정 및 컴퓨터 사용률 모니터링
│   ├── prisma/                        # Prisma 데이터베이스 서비스
│   │   └── prisma.service.ts          # Prisma 서비스 (데이터베이스와의 연결 및 트랜잭션 처리)
│   └── users/                         # 사용자 관련 모듈
│       └── services/
│           └── user.service.ts        # 사용자 데이터 관리 로직
├── struct.txt                         # 프로젝트 구조를 설명하는 파일 (구조 관련 메모)
├── test/                              # 테스트 관련 코드
│   ├── app.e2e-spec.ts                # end-to-end 테스트 파일 (통합 테스트)
│   └── jest-e2e.json                  # Jest 테스트 설정 파일
├── tsconfig.build.json                # 타입스크립트 빌드 설정 파일
└── tsconfig.json                      # 타입스크립트 설정 파일

```

### 자원서버

```
resource-server/
├── prisma/
│       └── schema.prisma               # prisma 스키마 정의
├── generated/                          # proto파일 컴파일을 통해 나온 stub
|       └── auth.ts
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
