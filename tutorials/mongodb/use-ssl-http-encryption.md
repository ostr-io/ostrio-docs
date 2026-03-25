SSL/TLS/HTTPS Encrypted connection
======

Assuming you have SSL/TLS certificate and private key, if not [read how to generate one for free](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/ssl/ssl-letsencrypt.md). All examples below for case when certificate, chain and private key at `/etc/nginx/ssl/` directory.

### 1. Get Root Certificate
Get one [from here](https://www.identrust.com/certificates/trustid/root-download-x3.html), or copy-paste from below to `/etc/nginx/ssl/ca.crt`:
```plain
-----BEGIN CERTIFICATE-----
MIIDSjCCAjKgAwIBAgIQRK+wgNajJ7qJMDmGLvhAazANBgkqhkiG9w0BAQUFADA/
MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT
DkRTVCBSb290IENBIFgzMB4XDTAwMDkzMDIxMTIxOVoXDTIxMDkzMDE0MDExNVow
PzEkMCIGA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMRcwFQYDVQQD
Ew5EU1QgUm9vdCBDQSBYMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AN+v6ZdQCINXtMxiZfaQguzH0yxrMMpb7NnDfcdAwRgUi+DoM3ZJKuM/IUmTrE4O
rz5Iy2Xu/NMhD2XSKtkyj4zl93ewEnu1lcCJo6m67XMuegwGMoOifooUMM0RoOEq
OLl5CjH9UL2AZd+3UWODyOKIYepLYYHsUmu5ouJLGiifSKOeDNoJjj4XLh7dIN9b
xiqKqy69cK3FCxolkHRyxXtqqzTWMIn/5WgTe1QLyNau7Fqckh49ZLOMxt+/yUFw
7BZy1SbsOFU5Q9D8/RhcQPGX69Wam40dutolucbY38EVAjqr2m7xPi71XAicPNaD
aeQQmxkqtilX4+U9m5/wAl0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNV
HQ8BAf8EBAMCAQYwHQYDVR0OBBYEFMSnsaR7LHH62+FLkHX/xBVghYkQMA0GCSqG
SIb3DQEBBQUAA4IBAQCjGiybFwBcqR7uKGY3Or+Dxz9LwwmglSBd49lZRNI+DT69
ikugdB/OEIKcdBodfpga3csTS7MgROSR6cz8faXbauX+5v3gTt23ADq1cEmv8uXr
AvHRAosZy5Q6XkjEGB5YGV8eAlrwDPGxrancWYaLbumR9YbK+rlmM6pZW87ipxZz
R8srzJmwN0jP41ZL9c8PDHIyh8bwRLtTcm1D9SZImlJnt1ir/md2cXjbDaJWFBM5
JDGFoqgCWjBH4d1QB7wCCZAA62RjYJsWvIjJEubSfZGL+T0yjWW06XyxV3bqxbYo
Ob8VZRzI9neWagqNdwvYkQsEjgfbKbYK7p2CNTUQ
-----END CERTIFICATE-----

```
__Note: new line "\n" at the end of the file is important__

Append let's encrypt chain:
```shell
# At /etc/nginx/ssl/ directory
# cd /etc/nginx/ssl/
cat chain.pem >> ca.crt
```

### 2. Concatenate Key and Certificate
```shell
# Go to folder with certificates
# for example: /etc/nginx/ssl/
cat privkey.pem cert.pem > mongodb.pem
```

Verify:
```shell
openssl verify -CAfile ca.crt mongodb.pem
```

```shell
# Move concatenated cert & chain to
# mongodb owned directory,
# for example to: /data/mongo/
mv /etc/nginx/ssl/mongodb.pem /data/mongo/
mv /etc/nginx/ssl/ca.crt /data/mongo/

# Secure files:
chown mongodb:mongodb /data/mongo/mongodb.pem
chmod 400 /data/mongo/mongodb.pem
chown mongodb:mongodb /data/mongo/ca.crt
chmod 400 /data/mongo/ca.crt
```

### 3. Edit MongoDB Configuration file
Assuming main mongo configuration at `/etc/mongod.conf`:
```shell
# nano /etc/mongod.conf
net:
  ssl:
    mode: requireSSL
    PEMKeyFile: /data/mongo/mongodb.pem
    CAFile: /data/mongo/ca.crt
```

Note: same can be accomplished with `mongod` command flags:
```shell
mongod --sslMode requireSSL --sslPEMKeyFile <pem>
```

Check logs for errors:

```shell
tail -n 50 -f /var/log/mongodb/mongod.log
# ctrl + c to exit tail command
```

### Connect:

```shell
mongo mongodb://[hostname]:[PORT]/ --ssl --sslPEMKeyFile=/etc/nginx/ssl/mongodb.pem
```

### Connect in app (node.js):

```js
// Note: File "mongodb.pem" must accessible
// make sure parent folder and file has 404 or higher permissions

const fs = require('fs');
MongoClient.connect('mongodb://[hostname]:[PORT]?ssl=true', {
  ssl: true,
  sslKey: fs.readFileSync('/path/to/mongodb.pem'),
  sslCert: fs.readFileSync('/path/to/mongodb.pem'),
  sslValidate: true
}, (mongoErr, db) => {
  /* .... */
});
```

## Further reading:

- [gist](https://gist.github.com/leommoore/1e773a7d230ca4bbe1c2) by @leommoore
- Read [official mongodb reference](https://docs.mongodb.com/manual/tutorial/configure-ssl/) for more info.
