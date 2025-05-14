cd ..
helm uninstall stmgr -n media
helm install stmgr ./kube/server -n media
pause
