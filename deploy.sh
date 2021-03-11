# Build our images
docker build -t sjmcdowall/multi-client:latest -t sjmcdowall/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t sjmcdowall/multi-server:latest -t sjmcdowall/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t sjmcdowall/multi-worker:latest -t sjmcdowall/multi-worker:$SHA -f ./worker/Dockerfile ./worker

# Push up to the hub the latest tags
docker push sjmcdowall/multi-client:latest
docker push sjmcdowall/multi-server:latest
docker push sjmcdowall/multi-worker:latest

# Push up to the hub the GIT SHA tags
docker push sjmcdowall/multi-client:$SHA
docker push sjmcdowall/multi-server:$SHA
docker push sjmcdowall/multi-worker:$SHA

# Apply our k8s config files
kubectl apply -f k8s

# Refresh the deployment to use the image
kubectl set image deployment/multi-client-deployment client=sjmcdowall/multi-client:$SHA
kubectl set image deployment/multi-server-deployment server=sjmcdowall/multi-server:$SHA
kubectl set image deployment/multi-worker-deployment worker=sjmcdowall/multi-worker:$SHA

