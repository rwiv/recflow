cd ..
helm uninstall stmgr -n media
helm install stmgr ./helm -n media
pause
