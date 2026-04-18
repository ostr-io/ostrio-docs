# Disable SSH login for root user

## Why?

- Most of the automatic brute-force software starts with attacking SSH service on `22` port and try to match a password for the `root` user
- `root` user is not the only user under risk, brute-force software has abundant dictionaries of most common used user-names, so it's a good idea to  [create a user](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/users/create-user.md) with some random-gibberish name, like: `QBHZEEQXT`

## Before you go:

- [Create Linux user](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/users/create-user.md)
- [Create restricted Linux user](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/users/rbash.md)

Edit `/etc/ssh/sshd_config` file:

```shell
# nano /etc/ssh/sshd_config

# Find line starting with "PermitRootLogin"
# change "yes" to "no":
PermitRootLogin no

# Save file with: "ctrl + o" combination
# Close file with: "ctrl + x" combination
```

Add extra security layer, with limiting login only to a single user (*optional*):

```shell
# nano /etc/ssh/sshd_config

# Add new line, where [username]
# is the name of ONLY allowed to
# login over SSH user:
AllowUsers [username]

# Save file with: "ctrl + o" combination
# Close file with: "ctrl + x" combination
```

Restart SSH service:

```shell
service sshd restart
```

## Further reading:

- [Change Default SSH port](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/change-ssh-port.md)
- [Use SSH keys to login](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/use-ssh-keys.md)
