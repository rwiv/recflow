# server
helm-server-run:
	helm install recflow ../kube/server -n media -f ../dev/values.yaml

helm-server-rm:
	helm uninstall recflow -n media


# expose
helm-expose-run:
	-@helm install recflow-expose ../kube/expose -n media

helm-expose-rm:
	-@helm uninstall recflow-expose -n media


# postgresql
helm-pg-dep:
	-@helm dependency update ../kube/postgresql
	-@helm dependency update ../kube/postgresql-exporter

helm-pg-prod-run:
	helm install recflow-postgresql ../kube/postgresql -n media

helm-pg-prod-upgrade:
	helm upgrade recflow-postgresql ../kube/postgresql -n media

helm-pg-prod-rm:
	helm uninstall recflow-postgresql -n media

delete-pg-prod-pvc:
	kubectl delete pvc data-recflow-postgresql-0 -n media


helm-pg-stage-run:
	helm install recflow-postgresql ../kube/postgresql -n stage \
		--set metadata.namespace=stage \
		--set postgresql.primary.service.type=NodePort \
		--set postgresql.primary.service.nodePorts.postgresql=30229 \
		--set postgresql.primary.persistence.storageClass=rook-ceph-block \
		--set postgresql.primary.resources.requests.cpu=500m \
		--set postgresql.primary.resources.limits.cpu=1000m

helm-pg-stage-rm:
	helm uninstall recflow-postgresql -n stage

delete-pg-stage-pvc:
	kubectl delete pvc data-recflow-postgresql-0 -n stage


#helm-pg-cleaner-run:
#	helm install recflow-postgresql-cleaner ../kube/postgresql-cleaner -n media
#
#helm-pg-cleaner-rm:
#	helm uninstall recflow-postgresql-cleaner -n media


helm-pg-exporter-run:
	helm install recflow-postgresql-exporter ../kube/postgresql-exporter -n media

helm-pg-exporter-rm:
	helm uninstall recflow-postgresql-exporter -n media


# redis
helm-redis-dep:
	-@helm dependency update ./redis

helm-prod-redis-run:
	-@helm install recflow-redis ../kube/redis -n media

helm-prod-redis-rm:
	-@helm uninstall recflow-redis -n media

delete-prod-redis-pvc:
	-@kubectl delete pvc redis-data-recflow-redis-master-0 -n media

helm-stage-redis-run:
	-@helm install recflow-redis ../kube/redis -n stage \
		--set metadata.namespace=stage \
		--set redis.master.persistence.enabled=false \
		--set redis.master.service.type=NodePort \
		--set redis.master.service.nodePorts.redis=30228

helm-stage-redis-rm:
	-@helm uninstall recflow-redis -n stage
