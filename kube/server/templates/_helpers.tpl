{{- define "stmgr.app.env" -}}
- name: NODE_ENV
  value: prod
- name: APP_PORT
  value: "{{ .Values.service.targetPort }}"
- name: STREAMQ_URL
  value: {{ .Values.externals.streamq.url }}
- name: STREAMQ_QSIZE
  value: "{{ .Values.externals.streamq.qsize }}"
- name: STLINK_ENDPOINT
  value: {{ .Values.externals.stlink.endpoint }}
- name: STLINK_ENDPOINT_DOMESTIC
  value: {{ .Values.externals.stlink.endpointDomestic }}
- name: STLINK_ENDPOINT_OVERSEAS
  value: {{ .Values.externals.stlink.endpointOverseas }}
- name: STLINK_HTTP_TIMEOUT_MS
  value: "{{ .Values.externals.stlink.httpTimeoutMs }}"
- name: STLINK_ENFORCE_AUTH_FOR_FOLLOWED
  value: "{{ .Values.externals.stlink.enforceAuthForFollowed }}"
- name: STLINK_USE_PROXY
  value: "false"
- name: UNTF_ENDPOINT
  value: {{ .Values.externals.untf.endpoint }}
- name: UNTF_API_KEY
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externals.untf.secretName }}
      key: {{ .Values.externals.untf.apiKeySecretKey }}
- name: UNTF_TOPIC
  value: {{ .Values.externals.untf.topic }}
- name: SERVER_REDIS_HOST
  value: {{ .Values.app.redis.host }}
- name: SERVER_REDIS_PORT
  value: "{{ .Values.app.redis.port }}"
- name: SERVER_REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Values.app.redis.secrets.auth.name }}
      key: {{ .Values.app.redis.secrets.auth.passwordKey }}
- name: FS_NAME
  value: {{ .Values.app.fsName }}
- name: STDL_DEFAULT_LOCATION
  value: {{ .Values.externals.stdl.locations.default }}
- name: STDL_FOLLOWED_LOCATION
  value: {{ .Values.externals.stdl.locations.followed }}
- name: STDL_REDIS_MASTER_HOST
  value: {{ .Values.externals.stdl.redis.masterHost }}
- name: STDL_REDIS_MASTER_PORT
  value: "{{ .Values.externals.stdl.redis.masterPort }}"
- name: STDL_REDIS_REPLICA_HOST
  value: {{ .Values.externals.stdl.redis.replicaHost }}
- name: STDL_REDIS_REPLICA_PORT
  value: "{{ .Values.externals.stdl.redis.replicaPort }}"
- name: STDL_REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externals.stdl.redis.secrets.auth.name }}
      key: {{ .Values.externals.stdl.redis.secrets.auth.passwordKey }}
- name: PG_HOST
  value: {{ .Values.app.postgres.host }}
- name: PG_PORT
  value: "{{ .Values.app.postgres.port }}"
- name: PG_DATABASE
  value: {{ .Values.app.postgres.database }}
- name: PG_USERNAME
  valueFrom:
    secretKeyRef:
      name: {{ .Values.app.postgres.secretName }}
      key: {{ .Values.app.postgres.usernameKey }}
- name: PG_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ .Values.app.postgres.secretName }}
      key: {{ .Values.app.postgres.passwordKey }}
- name: SQS_ACCESS_KEY
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externals.sqs.secretName }}
      key: {{ .Values.externals.sqs.accessKeyKey }}
- name: SQS_SECRET_KEY
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externals.sqs.secretName }}
      key: {{ .Values.externals.sqs.secretKeyKey }}
- name: SQS_REGION_NAME
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externals.stdl.queue.secretName }}
      key: {{ .Values.externals.stdl.queue.regionNameKey }}
- name: SQS_QUEUE_URL
  valueFrom:
    secretKeyRef:
      name: {{ .Values.externals.stdl.queue.secretName }}
      key: {{ .Values.externals.stdl.queue.queueUrlKey }}
- name: HTTP_TIMEOUT_MS
  value: "{{ .Values.app.configs.httpTimeoutMs }}"
- name: LIVE_ALLOCATION_INIT_WAIT_SEC
  value: "{{ .Values.app.configs.liveAllocationInitWaitSec }}"
- name: LIVE_RECOVERY_INIT_WAIT_SEC
  value: "{{ .Values.app.configs.liveRecoveryInitWaitSec }}"
- name: LIVE_FINISH_TIMEOUT_SEC
  value: "{{ .Values.app.configs.liveFinishTimeoutSec }}"
- name: NODE_RESET_CYCLE_SEC
  value: "{{ .Values.app.configs.nodeResetCycleSec }}"
- name: NODE_FAILURE_THRESHOLD
  value: "{{ .Values.app.configs.nodeFailureThreshold }}"
- name: LIVE_STATE_INIT_WAIT_SEC
  value: "{{ .Values.app.configs.liveStateInitWaitSec }}"
- name: LIVE_STATE_EXPIRE_SEC
  value: "{{ .Values.app.configs.liveStateExpireSec }}"
- name: STDL_CLEAR_BATCH_SIZE
  value: "{{ .Values.app.configs.stdlClearBatchSize }}"
- name: CACHE_EXPIRE_SEC
  value: "{{ .Values.app.configs.cacheExpireSec }}"
- name: MAX_CONCURRENT_LIVE
  value: "{{ .Values.app.configs.maxConcurrentLive }}"
{{- end }}
