# 정의된 명령어들
all: lint format start

# auth-server 및 resource-server에서 lint와 format 수행
lint:
	@echo "Running lint for both servers..."
	cd auth-server && npm run lint
	cd resource-server && npm run lint

format:
	@echo "Running format for both servers..."
	cd auth-server && npm run format
	cd resource-server && npm run format

# 두 서버를 동시에 실행 (병렬 처리)
start:
	@echo "Starting both servers..."
	cd auth-server && npm run start:dev
	cd resource-server && npm run start:dev

# 모든 서버를 종료
stop:
	@echo "Stopping servers..."
	# 백그라운드 프로세스를 종료하는 명령어 추가 필요시 구현

# 포맷팅과 린트를 모두 수행한 후 서버 실행
deploy: lint format start
