cd ..
helm uninstall stmgr -n media
helm install stmgr ./kube/app -n media
pause
