# Single Server / Replica Set

For more info see [original article](https://veliovgroup.com/article/2qsjtNf8NSB9XxZDh/mongodb-replica-set-with-oplog).

We will use wiredTiger as engine, you can read [its release notes](https://www.mongodb.com/blog/post/whats-new-mongodb-30-part-3-performance-efficiency-gains-new-storage-architecture) to find out more about its benefits.

### Definitions:

- `admin` user - User with full `root` access to MongoDB features and commands
- `appUser` - User with `readWrite` access to database used for your application
- `appDB` - Database used for application
- `<password>` - placeholder, should be changed to strong password. __Always placed in double quotes__

### 1. Installation:
Follow steps described in [installation guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian). During installation `mongodb` user in `mongodb` group will be created automatically

### 2. Create and set right permissions for storage folders:
```shell
mkdir -p /data/mongos/one /data/mongos/two /data/mongos/three
chmod 755 /data
chown -R mongodb:mongodb /data/mongos
```

### 3. Create and set permissions for log folders:
```shell
mkdir -p /var/log/mongodb/one /var/log/mongodb/two /var/log/mongodb/three
chown -R mongodb:mongodb /var/log/mongodb
```

### 4. Remove `mongod` service scripts (*if exists*):
```shell
rm /etc/init.d/mongod
```

### 5. Edit MongoDB configuration file:
For first member of Replica Set (`nano /etc/mongod-one.conf`):
```yaml
storage:
  dbPath: /data/mongos/one
  journal:
    enabled: true
  engine: wiredTiger
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/one/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
replication:
  replSetName: rs0
```

### 6. Edit MongoDB configuration:
For second member of Replica Set (`nano /etc/mongod-two.conf`):
```yaml
storage:
  dbPath: /data/mongos/two
  journal:
    enabled: true
  engine: wiredTiger
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/two/mongod.log
net:
  port: 27018
  bindIp: 127.0.0.1
replication:
  replSetName: rs0
```

### 7. Edit MongoDB configuration:
For third member of Replica Set (`nano /etc/mongod-three.conf`):
```yaml
storage:
  dbPath: /data/mongos/three
  journal:
    enabled: true
  engine: wiredTiger
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/three/mongod.log
net:
  port: 27019
  bindIp: 127.0.0.1
replication:
  replSetName: rs0
```

### 8. Create shared auth key:
For secure communication between Replica Set members ([more info](https://docs.mongodb.com/v3.2/tutorial/enforce-keyfile-access-control-in-existing-replica-set/)):
```shell
openssl rand -base64 741 > /data/mongos/key
chown mongodb:mongodb /data/mongos/key
chmod 400 /data/mongos/key
```

### 9. Create CRON job
To start MongoDB as `mongodb` user (`crontab -u mongodb -e`):
```cron
@reboot /usr/bin/mongod --config /etc/mongod-one.conf --fork
@reboot /usr/bin/mongod --config /etc/mongod-two.conf --fork
@reboot /usr/bin/mongod --config /etc/mongod-three.conf --fork
```

### 10. Reboot the machine

### 11. Configure and initiate Replica Set:
```shell
$ mongo # <-- Mongo Shell
var conf = {
    "_id" : "rs0",
    "members" : [
      {
        "_id" : 0,
        "host" : "127.0.0.1:27017"
      },
      {
        "_id" : 1,
        "host" : "127.0.0.1:27018"
      },
      {
        "_id" : 2,
        "host" : "127.0.0.1:27019"
      }
    ]
}
rs.initiate(conf)
```

### 12. Define PRIMARY member:
Next steps should be performed only on PRIMARY member. To find out which member is primary, run:
```shell
# Mongo Shell
rs.status()
```

### 13. On PRIMARY: Create `admin` user:
With `root` privileges:
```shell
# Mongo Shell:
$ mongo --port 27017
use admin
db.createUser({user:"admin", pwd:<password>, roles:[{role:"root", db:"admin"}]})
```

### 14. Update CRON job:
To start MongoDB with `--auth` option (`crontab -u mongodb -e`) this will protect MongoDB from unauthorized access (for higher security read [this article](https://docs.mongodb.com/manual/administration/security-checklist/)):
```cron
@reboot /usr/bin/mongod --config /etc/mongod-one.conf --auth --fork
@reboot /usr/bin/mongod --config /etc/mongod-two.conf --auth --fork
@reboot /usr/bin/mongod --config /etc/mongod-three.conf --auth --fork
```

### 15. Add next lines:
To __each__ configuration of Replica Set members: 
```yaml
# nano /etc/mongod-one.conf
# nano /etc/mongod-two.conf
# nano /etc/mongod-three.conf
security:
  keyFile: /data/mongos/key
```

### 16. Reboot the machine

### 17. Create application user:
With `readWrite` permissions for db of your app (*you will use this user to access MongoDB from your application*):
```shell
# Mongo Shell `mongo -u "admin" -p <password> --authenticationDatabase "admin"`
use admin
db.createUser({user:"appUser", pwd:<password>, roles:[{role:"readWrite", db:"appDB"}]})
```

### 19. Make sure all users are properly created:
```shell
# Mongo Shell `mongo -u "admin" -p <password> --authenticationDatabase "admin"`
use admin
show users
```

From this point MongoDB is available on loopback and localhost.

### 20. Connection strings:
```plain
mongodb://appUser:<password>@127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/appDB?authSource=admin&replicaSet=rs0
```

### Further reading:
 - [Use and configure OpLog](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/mongodb/enable-oplog.md)
