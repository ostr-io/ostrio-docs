# Restricted users (`rbash`)

Based on [`rbash` article](https://veliovgroup.com/article/BmtWycSfZL37zXMZc/how-to-rbash)

## When to use `rbash`?

- SSH login-only user
- Other users accounts
- Application users
- Other security and permission restriction cases

Example below creates `ruser`, with only access to `su` command. SSH login-only user is the great use case for `rbash`.

### Create a user

Create user named `ruser`:

```shell
useradd ruser
```

Set password for new user (*only users with password can login to a server*):

```shell
passwd ruser
# then type-in new password twice
```

### Confirm `rbash` is installed

`rbash` shell is preinstalled on most of Linux distributions, however, to confirm `rbash` shell is installed, execute next lines:

```shell
cat /etc/shells
# and:
which rbash
# both commands should have /bin/rbash in return
```

If `rbash` is not listed in `/etc/shells` install it via `agt-get` or `aptitude`. After installation, check `/etc/shells` again to make sure it is activated.

### Change user's shell

To change user's default shell use `chsh` (*__ch__ ange __sh__ ell*):

```shell
chsh -s /bin/rbash ruser
```

### Create user's home directory

```shell
# Create directory
mkdir -p /home/ruser

# Set home directory
usermod -m -d /home/ruser ruser
```

### Create shell profiles

```shell
# Go to ruser home directory
cd /home/ruser
# Create profile
touch .bashrc
echo "export PATH=/home/ruser/usr/bin" >> .bashrc
for i in .bash_login .bash_profile .bash_logout .bash_profile .profile; do cp .bashrc $i; done
```

### Create user's bin directory

```shell
mkdir -p /home/ruser/usr/bin
```

*From now, user named* `ruser` *after login via* `su`*,* `sudo` *or* `ssh` *can not run any commands.*

### Link allowed commands

For example, we would like to add `su`, as allowed command for `ruser`

```shell
which su
# returns /bin/su, copy it
ln -s /bin/su /home/ruser/usr/bin
#     │       └─ symlink to ruser's bin
#     └─ output from `which`
```

Repeat the same procedure for all commands (programs, packages) which should be allowed to run by `ruser`

### Set right permissions

```shell
chmod -R 750 /home/ruser
chown -R ruser:ruser /home/ruser
```

### Further reading:

- [Change default SSH port](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/change-ssh-port.md)
- [Disable root login via SSH](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/disable-ssh-root.md)
- [Use SSH keys to login](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/use-ssh-keys.md)
