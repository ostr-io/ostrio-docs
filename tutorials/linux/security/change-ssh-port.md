# Change default SSH port

The best practice of the "*best practices*" 😅 is to change default SSH port. As the Internet full of automated scanners and bots — most vulnerable are widely used default applications and ports.

Edit `/etc/ssh/sshd_config` file, — find and update value of the line staring with `Port` as a new value for port pick a number between `1024` and `65535`:

```shell
# nano /etc/ssh/sshd_config

# Find line starting with "Port":
Port 64537 # CHANGE TO PORT OF YOUR CHOICE 1024-65535

# Save file with: "ctrl + o" combination
# Close file with: "ctrl + x" combination
```

Restart SSH service:

```shell
service sshd restart
```

To connect again via SSH explicitly set port via `-p` flag:

```shell
ssh -p 64537 username@host
```

## Further reading:

- [Disable root login via SSH](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/disable-ssh-root.md)
- [Use SSH keys to login](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/use-ssh-keys.md)
- [Sample `sshd_config`](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/sshd_config)
