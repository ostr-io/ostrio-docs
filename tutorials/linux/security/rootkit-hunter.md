# Rootkit Hunter (RKHunter)

## References:

- [RKHunter project page](http://rkhunter.sourceforge.net/)
- Article by [Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-use-rkhunter-to-guard-against-rootkits-on-an-ubuntu-vps)
- For latest release [go here](https://sourceforge.net/projects/rkhunter/files/)

On the moment of writing latest release is: `v1.4.6 2018-02-24`

## Installation:

Download RKHunter script

```shell
wget https://downloads.sourceforge.net/project/rkhunter/rkhunter/1.4.6/rkhunter-1.4.6.tar.gz
```

Unpack RKHunter archive and install:

```shell
tar xzvf rkhunter-1.4.6.tar.gz
cd rkhunter-1.4.6
./installer.sh --install
cd ../
rm -Rf rkhunter-1.4.6*
```

### Install prerequisites:

```shell
apt-get install binutils libreadline5 ssl-cert unhide
```

RKHunter also requires `ruby` to be installed. Read more about [ruby installation](https://www.ruby-lang.org/en/documentation/installation).

## Update RKHunter database and generate file properties database used by RKHunter:

```shell
rkhunter --update --propupd
```

## Run full system check:

```shell
rkhunter -c --enable all --disable none
```

Read more detailed setup at [Digital Ocean article](https://www.digitalocean.com/community/tutorials/how-to-use-rkhunter-to-guard-against-rootkits-on-an-ubuntu-vps)

## Further reading:

- [Use Lynis for security audit](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/lynis-security-audit.md)
- [Basic firewall with `iptables`](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/iptables-firewall.md)
- [Digital Ocean article](https://www.digitalocean.com/community/tutorials/how-to-use-rkhunter-to-guard-against-rootkits-on-an-ubuntu-vps)
