helm-dep:
	helm dependency update ../kube/postgresql

helm-pg-prod-run:
	helm install stmgr-postgresql ../kube/postgresql -n media

helm-pg-prod-upgrade:
	helm upgrade stmgr-postgresql ../kube/postgresql -n media

helm-pg-prod-rm:
	helm uninstall stmgr-postgresql -n media

delete-pg-prod-pvc:
	-@kubectl delete pvc data-stmgr-postgresql-0 -n media


helm-pg-stage-run:
	helm install stmgr-postgresql ../kube/postgresql -n stage \
		--set metadata.namespace=stage \
		--set postgresql.primary.service.nodePorts.postgresql=30229

helm-pg-stage-rm:
	helm uninstall stmgr-postgresql -n stage

delete-pg-stage-pvc:
	-@kubectl delete pvc data-stmgr-postgresql-0 -n stage
