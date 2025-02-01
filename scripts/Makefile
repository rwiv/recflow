helm-pg-prod-run:
	helm install stmgr-pg ../kube/postgres -n media

helm-pg-prod-rm:
	helm uninstall stmgr-pg -n media

helm-pg-stage-run:
	helm install stmgr-pg ../kube/postgres -n stage \
		--set database.nodePort=30229

helm-pg-stage-rm:
	helm uninstall stmgr-pg -n stage
