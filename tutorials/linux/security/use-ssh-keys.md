# SSH key-based authentication

## Why?

- No chance to brute-force SSH service if password-based login is disabled
- No need to type-in password on every login via SSH

## Disadvantages:

- No way to login if key-file is lost
- No way to login if passphrase from key-file is forgotten

## Create SSH keys

On __local__ linux-based (mac or linux) machine:

```shell
ssh-keygen

# "Enter file in which to save the key"
# it's a good idea to have separate
# keys for every host.
# Create a key with the name related to host
# ~/.ssh/my-app-proj

# "Enter passphrase"
# Skip "empty for no passphrase"
# or set passphrase to encrypt key
# so, even if it's leaked or stolen
# it will be useless without passphrase
```

### Add to keychain (*mac os*)

```shell
# To add keys permanently, use -K flag

ssh-add -K ~/.ssh/my-app-proj

# If the key file is created with the passphrase
# You will be asked to enter it
```

### Add key to server

On __local__ machine copy __public__ key:

```shell
# Copy contents of ~/.ssh/my-app-proj.pub
cat ~/.ssh/my-app-proj.pub
```

On a Server, to login as root (*less secure*):

```shell
# Paste copied public key to new line at:
nano ~/.ssh/authorized_keys
# Create file/folder if not exists
# Save file with: "ctrl + o" combination
# Close file with: "ctrl + x" combination
```

*Skip this step if root user will be used for login*. On a Server, to login as any other user (*secure*, [read how to create a user](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/users/create-user.md))

__Note:__ Do not forget to change `username` to actual users' name below:

```shell
# Go to users' home directory
cd /home/username

# Create .ssh directory (if not yet exists)
mkdir -p /home/username/.ssh

# Paste copied public key to the new line at:
nano /home/username/.ssh/authorized_keys
# Save file with: "ctrl + o" combination
# Close file with: "ctrl + x" combination

# Set right permissions
chmod -R 700 /home/username/.ssh
chmod -R 640 /home/username/.ssh/authorized_keys
chown -R username:username /home/username/.ssh
```

### Disable password auth (extra security)

If SSH keys are 100% secure and won't be lost. Disabling password authentication would add an extra layer of security:

```shell
# nano /etc/ssh/sshd_config
# find the line with PasswordAuthentication
# remove "#" if presented at the beginning of the line

PasswordAuthentication no
```

Restart SSH service:

```shell
service sshd restart
```

### Issue with multiple keys (mac os)

Having multiple keys in the system keychain would result SSH command to try login with each of added "identity file" keys in alphabet order. By default, Linux server will accept only 5 login attempts per connection, so having more than 5 SSH keys in the keychain will result in rejected connection. To solve this issue use `-i` flag to explicitly set "identity file":

```shell
ssh -i ~/.ssh/my-app-proj username@host -o PubkeyAuthentication=no
```

### Login with password (mac os)

To force login with password, use `-o PubkeyAuthentication=no` and/or `-o PreferredAuthentications="password"` flags:

```shell
ssh username@host -o PubkeyAuthentication=no
# or
ssh username@host -o PreferredAuthentications="password"
# or use both flags:
ssh username@host -o PreferredAuthentications="password" -o PubkeyAuthentication=no
```

"Too many authentication failures" error can get fixed with `-o IdentitiesOnly=yes` flag:

```shell
ssh username@host -o IdentitiesOnly=yes
```

### Further reading:

- [SSH Key-Based Authentication by DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server)
- [Change Default SSH port](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/change-ssh-port.md)
- [Disable root login via SSH](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/disable-ssh-root.md)
- [Sample `sshd_config`](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/sshd_config)
