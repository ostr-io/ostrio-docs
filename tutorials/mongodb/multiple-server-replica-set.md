# Multiple Server / Replica Set

For more info see [original article](https://veliovgroup.com/article/2qsjtNf8NSB9XxZDh/mongodb-replica-set-with-oplog).

## Before you go:

- Replica Set requires __at least 3__ servers (virtual or dedicated, if more than 3 servers - number of servers must be odd (e.g. 3, 5, 7, 9...))
- Read how to [use SSL certificates with MongoDB](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/mongodb/use-ssl-http-encryption.md)
- Make sure MongoDB port is open and accessible for other members of replica set, usually done with `iptables`. At least make sure all servers can ping each other

We will use `wiredTiger` as database engine, you can read [its release notes](https://www.mongodb.com/blog/post/whats-new-mongodb-30-part-3-performance-efficiency-gains-new-storage-architecture) to find out more about its benefits.

## Definitions:

- `admin` user - User with full `root` access to MongoDB features and commands
- `appUser` - User with `readWrite` access to database used for your application
- `appDB` - Database used for application
- `<password>` - placeholder, should be changed to strong password. __Always placed in double quotes__

## Steps

Go through 1-16 steps in order to install an configure MongoDB 3+ ReplicaSet

### 1. Installation:

On __each__ server follow steps described in [installation guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian). During installation `mongodb` user in `mongodb` group will be created automatically

### 2. On __each__ server create and set right permissions for storage folder:

```shell
mkdir -p /data/mongo
chown -R mongodb:mongodb /data/mongo
chmod 755 /data
chmod -R 700 /data/mongo
```

### 3. On __each__ server create and set permissions for log folder:

```shell
mkdir -p /var/log/mongodb
chown -R mongodb:mongodb /var/log/mongodb
```

### 4. Edit/check `mongod` `systemd` service

Create service (*if not created during installation*), if file exists — review it checking `User`, `Group`, and `ExecStart` values. Use `vim` or `nano` to open/create service file `/lib/systemd/system/mongod.service`:

```systemd
[Unit]
Description=MongoDB Database Server
After=network.target
Documentation=https://docs.mongodb.org/manual

[Service]
User=mongodb
Group=mongodb
EnvironmentFile=-/etc/default/mongod
ExecStart=/usr/bin/mongod --config /etc/mongod.conf
# on most virtual machines mongodb performs much better via numactl
#ExecStart=/usr/bin/numactl --interleave all /usr/bin/mongod --config /etc/mongod.conf
PIDFile=/var/run/mongodb/mongod.pid
# file size
LimitFSIZE=infinity
# cpu time
LimitCPU=infinity
# virtual memory size
LimitAS=infinity
# open files
LimitNOFILE=64000
# processes/threads
LimitNPROC=64000
# locked memory
LimitMEMLOCK=infinity
# total threads (user+kernel)
TasksMax=infinity
TasksAccounting=false

# Recommended limits for for mongod as specified in
# http://docs.mongodb.org/manual/reference/ulimit/#recommended-settings

[Install]
WantedBy=multi-user.target
```

#### 4.1. Enable service

Enable `systemd` service

```shell
systemctl --now enable mongod
```

### 5. On __each__ server edit MongoDB configuration file (`nano /etc/mongod.conf`):

Create/edit `/etc/mongod.conf` file. Before authentication enable use `transitionToAuth` option

1. Change `[PORT, DEFAULT: 27017]` to port of your choice
2. Change `[IP ADDRESS, OR DOMAIN NAME]` to public IP address, VLAN/LAN IP Address, or domain name (can be comma separated, like: mongo.example.com,127.0.0.1,A.B.C.D). Domain name is required if SSL is set to `requireSSL` ([more info](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/mongodb/use-ssl-http-encryption.md))

```yaml
processManagement:
  fork: true
storage:
  dbPath: /data/mongo
  journal:
    enabled: true
  engine: wiredTiger
net:
  port: [PORT, DEFAULT: 27017]
  bindIp: [IP ADDRESS, OR DOMAIN NAME]
  unixDomainSocket:
    enabled: false
operationProfiling:
  slowOpThresholdMs: 2100
  mode: off
replication:
  replSetName: rs0
security:
  transitionToAuth: true
  # keyFile: /data/mongo/key
  # authorization: enabled
```

### 6. On __one__ server generate shared auth key:

Generate random key for secure communication between Replica Set members ([more info](https://docs.mongodb.com/v3.2/tutorial/enforce-keyfile-access-control-in-existing-replica-set/)):

```shell
openssl rand -base64 741 > /data/mongo/key
chown mongodb:mongodb /data/mongo/key
chmod 400 /data/mongo/key

# Copy-paste generated key
# to other servers (members)
# so output key contents run:
cat /data/mongo/key
```

### 7. On __each__ server start `mongod` service

Start MongoDB service

```cron
systemctl start mongod
```

### 8. Check logs for errors:

Use `tail` to open `/var/log/mongodb/mongod.log` log-file with live updates

```shell
tail -n 50 -f /var/log/mongodb/mongod.log
# ctrl + c to exit tail command
```

### 9. On __one__ server configure and initiate Replica Set:

On the server — connect to the MongoDB using `mongo` command, then initiate replica set for 3+ members.

```shell
# Mongo Shell - connect to the MongoDB using `mongo` command
var conf = {
  "_id" : "rs0",
  "members" : [
    {
      "_id" : 0,
      "host" : "[MEMBER IP/or/DOMAIN 1]:[PORT, DEFAULT: 27017]"
    },
    {
      "_id" : 1,
      "host" : "[MEMBER IP/or/DOMAIN 2]:[PORT, DEFAULT: 27018]"
    },
    {
      "_id" : 2,
      "host" : "[MEMBER IP/or/DOMAIN 3]:[PORT, DEFAULT: 27019]"
    }
  ]
}
rs.initiate(conf)
```

### 10. Find PRIMARY member:

Next steps should be performed only on PRIMARY member. To find out which member is primary, run:

```shell
# Mongo Shell - connect to the MongoDB using `mongo` command
rs.status()
```

### 11. On PRIMARY: Create `admin` user:

After connecting to the PRIMARY member — create new user with `root` privileges, replace `<password>` with a String

```shell
# Mongo Shell - connect to the MongoDB using `mongo` command
use admin
db.createUser({user:"admin", pwd:<password>, roles:[{role:"root", db:"admin"}]})
```

### 12. On __each__ server update `mongod.conf`:

Update `/etc/mongod.conf` using `nano` or `vim` text editors.

1. Remove/comment `transitionToAuth`
2. Add `keyFile`
3. Enable `authorization` option

```yaml
# nano /etc/mongod.conf
# ... last 4 lines ...
security:
  # transitionToAuth: true
  keyFile: /data/mongo/key
  authorization: enabled
```

### 13. Restart `mongod` service

```shell
service mongod restart
```

### 14. On PRIMARY: Create application user:

Create `appUser` user with `readWrite` permissions (*assuming this user will be used to access MongoDB from application*):

```shell
# Mongo Shell `mongo -u "admin" -p <password> --authenticationDatabase "admin"`
use admin
db.createUser({user:"appUser", pwd:<password>, roles:[{role:"readWrite", db:"appDB"}]})
```

### 15. On PRIMARY: Make sure all users are properly created:

```shell
# Mongo Shell `mongo -u "admin" -p <password> --authenticationDatabase "admin"`
use admin
show users
```

### 16. Update connection string:

Update connection string within application

```plain
mongodb://appUser:<password>@<IP_OR_DOMAIN_1>:<PORT>,<IP_OR_DOMAIN_2>:<PORT>,<IP_OR_DOMAIN_3>:<PORT>/appDB?authSource=admin&replicaSet=rs0
```

## Further reading:

- [Use and configure OpLog](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/mongodb/enable-oplog.md)