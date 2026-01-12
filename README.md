# recflow

**Live Recording Orchestration Server**

recflow는 분산 환경에서 고가용성을 보장하는 라이브 스트리밍 자동 녹화 및 후처리 시스템입니다.

## Tech Stack

- Frontend: React, Vite, React-Router, Tanstack/React-Query, Zustand, Tailwind, Emotion, Shadcn/ui
- Backend: NestJS, PostgreSQL, Redis, Drizzle, BullMQ, Zod, Vitest
- Infrastructure: AWS SQS, AWS S3, Kubernetes, authentik (SSO)

## System Architecture

<img src="https://raw.githubusercontent.com/rwiv/stdocs/refs/heads/main/diagrams/recflow-infra.png">

- [recnode](https://github.com/rwiv/recnode): 실질적인 녹화 작업을 처리하는 node cluster
- [vodify](https://github.com/rwiv/vodify): 비디오 후처리 작업 (e.g. transcoding, loss check)을 수행하는 task queue service
- streamq: 여러 라이브 플랫폼(e.g. chzzk, soop)의 통일된 스키마를 제공하는 platfrom api gateway server

이러한 3개의 서비스는 다른 서비스들의 존재를 인지하지 못하며, 주어진 요청을 처리하는 작업만을 수행합니다. 오직 recflow만이 각 서비스의 존재를 인지합니다.

## Features

### Live Stream Recording

<img src="https://raw.githubusercontent.com/rwiv/stdocs/refs/heads/main/imgs/recflow/recording_lives.png">

- 특정 조건(criterion)을 만족하는 라이브를 자동으로 감지해 [recnode](https://github.com/rwiv/recnode) 노드에게 녹화 요청을 전송
    - 예: 제목에 '마인크래프트'가 포함된 시청자 500명 이상 라이브
- 녹화 종료 이벤트: [recnode](https://github.com/rwiv/recnode) 노드에게 종료 요청 → AWS SQS에 녹화 종료 이벤트 발행
    - 라이브 종료가 식별되면 자동으로 실행. 직접 종료하는 것도 가능.
    - 직접 종료 시 동영상 저장/삭제 선택 가능 → 실제 처리는 [vodify](https://github.com/rwiv/vodify) worker에서 수행

### Multi-Node Allocation

- 고가용성 + 네트워크 부하 분산을 위해 n개의 [recnode](https://github.com/rwiv/recnode) 노드에 동시 녹화 요청
    - 글로벌 락(redis로 구현됨)을 통한 중복 세그먼트 다운로드 차단
- 주기적으로 녹화중인 노드 상태 체크 → 장애 노드 감지 시 장애복구 로직 실행
    - 장애복구 (Failover) 로직: 새로운 최적 노드 검색 → 라이브에 할당
- 녹화 중 배포의 용이함을 위해 [recnode](https://github.com/rwiv/recnode) 노드를 그룹별로 묶어서 관리
    - 예: 그룹1/그룹2 종료 후 배포 → 그룹3/그룹4 종료 후 배포

<img src="https://raw.githubusercontent.com/rwiv/stdocs/refs/heads/main/diagrams/recflow-node.png">

<img src="https://raw.githubusercontent.com/rwiv/stdocs/refs/heads/main/imgs/recflow/nodes.png">

### Channel Data Management

<img src="https://raw.githubusercontent.com/rwiv/stdocs/refs/heads/main/imgs/recflow/channel_query.gif">

SQL 기반 채널 쿼리 예시 (+태그 필터링, 팔로워 순 정렬, 페이지네이션...)

## ERD

<img src="https://raw.githubusercontent.com/rwiv/stdocs/refs/heads/main/diagrams/recflow_erd.png">

- Channel domain tables
    - `platform`, `channel`, `channel_grade`, `channel_tag`, `channel_tag_map`
- Live domain tables
    - `live`, `live_stream`
- Node domain tables
    - `node_group`, `node`, `live_node`
- Criterion domain tables
    - `live_criterion`, `live_criterion_rule`, `live_criterion_unit`
