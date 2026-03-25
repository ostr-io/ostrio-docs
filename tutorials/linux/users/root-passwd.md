# Change root password

When it comes to purchasing virtual or dedicated Linux-based servers - its credentials is sent somehow over the wire (http(s), email, sms, push-notification and etc.). Any data sent over the wire - can not be trusted.

So after the first login to your new and shiny server - __change default passwords__.

Let's change `root` (the very powerful user) password:

```shell
# make sure we are root
whoami

# if output is: root
# run passwd command
passwd

# after starting passwd command
# it will ask to prompt new password twice
# yes, NOTHING WOULD GET TYPED it's fine!
# symbols just hidden as it's password
```

After new password is set logout from server with `exit` command. And login again with new password.

## Further reading:

- [Change default SSH port](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/change-ssh-port.md)
- [Disable root login via SSH](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/disable-ssh-root.md)
- [Use SSH keys to login](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/use-ssh-keys.md)
