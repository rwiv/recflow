# stmgr

라이브 스트리밍 채널 데이터를 관리하고 라이브 녹화 서비스 인프라에서 오케스트레이션 작업을 담당하는 서버


## Features

- 라이브 녹화
  - 특정 조건(criterion)을 만족하는 라이브를 자동으로 감지해 [stdl](https://github.com/rwiv/stdl) 노드에게 녹화 요청을 전송
- 채널 데이터 관리
  - 고급 채널 쿼리 (e.g. 태그 필터링, 팔로워 순 정렬, 페이지네이션...)
- 고급 노드 할당 매커니즘
  - 노드 분배 기능: 라이브 녹화로 인한 노드의 시스템/네트워크 부하를 균등하게 분배
  - 노드 그룹 기능: 고가용성, 손쉬운 배포
- 녹화 장애 감지/복구 기능
- 인증/인가 기능은 외부 SSO(authentik)에 위임


## Tech Stack

- Frontend: React, React-Router, Tanstack/React-Query, Zustand, Tailwind, Emotion, Shadcn/ui
- Backend: NestJS, Drizzle, BullMQ, Zod, Vitest
- Infrastructure: PostgreSQL, Redis, AWS SQS, AWS S3, Kubernetes, authentik (SSO)


## System Architecture

이 서버 애플리케이션은 다음 서비스들과 통신합니다.

- [stdl](https://github.com/rwiv/stdl)
- [vidt](https://github.com/rwiv/vidt)

<img src="https://github.com/rwiv/stdocs/blob/main/diagrams/stmgr-infra.png">


## Domain Architecture

### Application Domains

- Channel
- Live
- Node
- Criterion

### ERD

<img src="https://github.com/rwiv/stdocs/blob/main/diagrams/stmgr_erd.png">

