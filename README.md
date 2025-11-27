# recflow

라이브 스트리밍 채널 데이터 관리, 라이브 녹화 라이프 사이클 관리 서버

## Tech Stack

- Frontend: React, React-Router, Tanstack/React-Query, Zustand, Tailwind, Emotion, Shadcn/ui
- Backend: NestJS, Drizzle, BullMQ, Zod, Vitest
- Infrastructure: PostgreSQL, Redis, AWS SQS, AWS S3, Kubernetes, authentik (SSO)


## System Architecture

<img src="https://github.com/rwiv/stdocs/blob/main/diagrams/recflow-infra.png">

- [recflow](https://github.com/rwiv/recflow)
- [recnode](https://github.com/rwiv/recnode)
- [vidt](https://github.com/rwiv/vidt)


## Features

### 채널 데이터 관리

<img src="https://github.com/rwiv/stdocs/blob/main/imgs/recflow/recording_lives.png">

고급 채널 쿼리 (e.g. 태그 필터링, 팔로워 순 정렬, 페이지네이션...)


### 라이브 녹화

<img src="https://github.com/rwiv/stdocs/blob/main/imgs/recflow/channel_query.gif">

- 특정 조건(criterion)을 만족하는 라이브를 자동으로 감지해 [recnode](https://github.com/rwiv/recnode) 노드에게 녹화 요청을 전송
- 녹화 장애 감지/복구 기능

### 고급 노드 할당

고가용성, 녹화중 배포, 네트워크 부하 분산을 위해 recording nodes를 그룹별로 묶어 관리


## ERD + Domain Architecture

<img src="https://github.com/rwiv/stdocs/blob/main/diagrams/recflow_erd.png">

- `Channel` domain
  - tables: platform, channel, channel_grade, channel_tag, channel_tag_map
- `Live` domain
  - tables: live, live_stream
- `Node` domain
  - tables: node_group, node, live_node
- `Criterion` domain
  - tables: live_criterion, live_criterion_rule, live_criterion_unit
