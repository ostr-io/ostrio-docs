Enable OpLog
======

For more info see [original article](https://veliovgroup.com/article/2qsjtNf8NSB9XxZDh/mongodb-replica-set-with-oplog).

### Before you go:
 - Read [what is OpLog](http://www.briancarpio.com/2012/04/21/mongodb-the-oplog-explain/)
 - Read [official MongoDB reference](https://docs.mongodb.com/manual/core/replica-set-oplog/)
 - Existing ReplicaSet is required for OpLog, read how to create one: [on single server](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/mongodb/single-server-replica-set.md) or [multiple (cluster) servers](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/mongodb/multiple-server-replica-set.md)

### Definitions:
 - `oplogger` user - User with `read` access to `local` database, where is OpLog is stored
 - `oplogger` role - Role which grants `read` access to `local` database
 - `<password>` - placeholder, should be changed to strong password. __Always placed in double quotes__

### 1. In Mongo Shell on PRIMARY: Create `oplogger` role:
```shell
# Mongo Shell:
use admin
db.runCommand({createRole:"oplogger", privileges:[{resource: {db:"local", collection:"system.replset"}, actions: ["find"]}], roles:[{role:"read", db:"local"}]})
```

### 2. In Mongo Shell on PRIMARY: Create `oplogger` user and grant `oplogger` role:
```javascript
// Mongo Shell:
use admin
// For MongoDB 2.4
db.createUser({user:"oplogger", pwd:<password>, roles:[], otherDBRoles:{local:["read"]}})
// For MongoDB >= 2.6
db.createUser({user:"oplogger", pwd:<password>, roles:[{role: "read", db: "local"}]})
db.runCommand({grantRolesToUser:"oplogger", roles:["oplogger"]})
```

### 3. In Mongo Shell on PRIMARY: Make sure user is properly created:
```shell
# Mongo Shell:
use admin
show users
```

### 4. Limit OpLog size:
By default OpLog will take 5% of __total__ disk size. It's a good idea to limit it.

If your application relies on OpLog and will read/watch for changes - OpLog size should fit in RAM, we recommend to set it to 25%-50% of RAM.

In examples below we set OpLog size to `8192` MB or 8Gb.

Via `/etc/mongod.conf`:
```yaml
replication:
  oplogSizeMB: 8192
  replSetName: rs0
```

Via `mongod` command flag:
```shell
mongod --oplogSize 8192 --config /etc/mongod.conf
```

__Note__: This won't work on existing OpLog, to change size of existing OpLog [read this article](https://docs.mongodb.com/manual/tutorial/change-oplog-size/).

### 5. Connection string:
```plain
mongodb://oplogger:<password>@<SRV_1>:<PORT>,<SRV_2>:<PORT>,<SRV_3>:<PORT>/local?authSource=admin&replicaSet=rs0
```
