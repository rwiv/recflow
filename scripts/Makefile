# postgresql
helm-pg-dep:
	-@helm dependency update ../kube/postgresql
	-@helm dependency update ../kube/postgresql-exporter

helm-pg-prod-run:
	helm install stmgr-postgresql ../kube/postgresql -n media

helm-pg-prod-upgrade:
	helm upgrade stmgr-postgresql ../kube/postgresql -n media

helm-pg-prod-rm:
	helm uninstall stmgr-postgresql -n media

delete-pg-prod-pvc:
	kubectl delete pvc data-stmgr-postgresql-0 -n media


helm-pg-exporter-run:
	helm install stmgr-postgresql-exporter ../kube/postgresql-exporter -n media

helm-pg-exporter-rm:
	helm uninstall stmgr-postgresql-exporter -n media


helm-pg-stage-run:
	helm install stmgr-postgresql ../kube/postgresql -n stage \
		--set metadata.namespace=stage \
		--set postgresql.primary.service.nodePorts.postgresql=30229

helm-pg-stage-rm:
	-@helm uninstall stmgr-postgresql -n stage
	-@kubectl delete pvc data-stmgr-postgresql-0 -n stage


# redis
helm-redis-dep:
	-@helm dependency update ./redis

helm-prod-redis-run:
	-@helm install stmgr-redis ../kube/redis -n media

helm-prod-redis-rm:
	-@helm uninstall stmgr-redis -n media

delete-prod-redis-pvc:
	-@kubectl delete pvc redis-data-stmgr-redis-master-0 -n media

helm-stage-redis-run:
	-@helm install stmgr-redis ../kube/redis -n stage \
		--set metadata.namespace=stage \
		--set redis.master.persistence.enabled=false \
		--set redis.master.service.nodePorts.redis=30228

helm-stage-redis-rm:
	-@helm uninstall stmgr-redis -n stage


# rabbitmq
helm-rabbitmq-dep:
	-@helm dependency update ../kube/rabbitmq

helm-rabbitmq-run:
	-@helm install stmgr-rabbitmq ../kube/rabbitmq -n media

helm-rabbitmq-rm:
	-@helm uninstall stmgr-rabbitmq -n media

delete-rabbitmq-pvc:
	-@kubectl delete pvc data-stmgr-rabbitmq-0 -n media

helm-rabbitmq-expose-run:
	-@helm install stmgr-rabbitmq-expose ../kube/rabbitmq-expose -n media

helm-rabbitmq-expose-rm:
	-@helm uninstall stmgr-rabbitmq-expose -n media


# expose
helm-expose-run:
	-@helm install stmgr-expose ../kube/expose -n media

helm-expose-rm:
	-@helm uninstall stmgr-expose -n media
