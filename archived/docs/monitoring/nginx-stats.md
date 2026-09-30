Basic stats for Nginx
======

This tutorial will show how to collect Nginx real-time connection metrics, like `active`, `reading`, `writing`, `waiting`. Including protection with simple `auth_basic`.

__Do not forget to change the value in between `<` and `>` symbols to your own value!__

#### First create `.htpasswd` file
```shell
# Go to nginx directory
cd /etc/nginx

# There are various online websites
# where you can easily generate 
# login / password pair
# if you don't trust them
# use htpasswd CLI as shown below
htpasswd .htpasswd <username>
# You will be asked to prompt a password for the user.
```

#### Nginx configuration
Let's assume you're editing `/etc/nginx/sites-available/default`
```shell
# Go to the sites-available directory
cd /etc/nginx/sites-available/
# Edit `default` file, we using nano in the example below, you're free to use your favorite editor
nano default
```

Configuration:
```nginx
server {
  listen 80 default_server deferred;
  server_name example.com;

  location / {
    # Return empty response or do something else here
    return 204;
  }

  location ~ ^/ngstat/ {
    # Use auth_basic with .htpasswd created above
    auth_basic "Show your pass please";
    auth_basic_user_file /etc/nginx/.htpasswd;

    try_files $uri @stat;
  }

  location @stat {
    # Internal redirect
    rewrite ^(.*)$ /__$1 last;
  }

  # Return as JSON
  location /__/ngstat/json {
    # This block is accessible only
    # after successful authentication
    internal;
    default_type "application/json";
    return 200 "{\"active\":$connections_active, \"reading\":$connections_reading, \"writing\":$connections_writing, \"waiting\":$connections_waiting}";
  }

  # Return as XML
  location /__/ngstat/xml {
    # This block is accessible only
    # after successful authentication
    internal;
    default_type "text/xml";
    return 200 "<data><active>$connections_active</active><reading>$connections_reading</reading><writing>$connections_writing</writing><waiting>$connections_waiting</waiting></data>";
  }
}
```

#### Make sure configuration syntax is valid
```shell
service nginx configtest
```

#### Reload configuration to apply changes
```shell
service nginx reload
```

#### Test endpoints
Next URLs will ask for login and password and return Nginx stats upon successful authentication:
```
http://example.com/ngstat/json
http://example.com/ngstat/xml
```

Add endpoint at [ostr.io](https://ostr.io):
 1. Go to [Monitoring](https://ostr.io/service/monitoring)
 2. Click on "*Add Endpoint*"
 3. To select server type-in its name
 4. Select "*HTTP*" (or *HTTPS*) in "*Protocol*" drop-down list
 5. Select desired "*Check Frequency*"
 6. Click on "*Add authentication*"
 7. Enter username provided to `htpasswd` command
 8. Enter password provided to `htpasswd` command
 9. Click on "*Add*" button
 10. Done!