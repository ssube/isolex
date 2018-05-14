# Deploy

This guide will help you deploy isolex to a kubernetes cluster.

If you do not have a namespace for isolex, you can create one:

```shell
kubectl create ns isolex
```

## Config

Prepare your config file and create a secret in the cluster with the contents:

```shell
kubectl create secret generic isolex-config --from-file=.isolex.yml --namespace=isolex
kubectl describe secret isolex-config --namespace=isolex -o yaml
```

should print:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: isolex-config
data:
  ".isolex.yml": "base64encoded==="
```

## Application

Create the application deployment:

```shell
kubectl apply -f isolex-deploy.yml --namespace=isolex
```

## Database

To use a persistent database, you will either need to add a data volume to the deployment or use a remote database
connection.

### Data Volume

To continue using Sqlite with persistent storage, create a persistent volume claim named `isolex-config`:

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: isolex-config
spec:
  accessModes:
    - ReadWriteOnce
  ...
```

Add the volume claim and mount to the application deployment:

```yaml
kind: Deployment
metadata:
  name: isolex
spec:
  template:
    spec:
      containers:
        - name: isolex-bot
          volumeMounts:
            - mountPath: "/data"
              name: isolex-config
      volumes:
        - name: isolex-config
          persistentVolumeClaim:
            claimName: isolex-config
```

### Remote Database

To use a remote database connection and one of the other drivers, create a container with the drivers installed, and
change the config `storage` stanza:

```yaml
storage:
  type: postgresql
  database: "tcp://isolex-postgres.isolex.svc.cluster.local:5432"
```

The [TypeORM docs describe the allowed options](https://github.com/typeorm/typeorm/blob/master/docs/connection-options.md).
