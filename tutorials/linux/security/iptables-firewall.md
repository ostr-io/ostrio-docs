# Basic firewall with iptables

__NOTE: IT'S A DANGER ZONE.__ This is expert-level settings setup. You must know what you're doing and do not blindly copy-paste commands and rules described below, otherwise, you may end up with the unaccessible server.

This tutorial will set iptables rules to accept traffic only on `http (80)`, `https (443)` and `ssh (22)` ports, which is the fine setup for most basic applications. Using suggested rules you're free to add more udp/tcp ports on demand.

See also the great article on iptables rules by [Digital Ocean](https://www.digitalocean.com/community/tutorials/iptables-essentials-common-firewall-rules-and-commands) and [VPS Cheap](https://crm.vpscheap.net/knowledgebase.php?action=displayarticle&id=29)

Start with creating the blank iptables file:

```shell
iptables-save > /etc/firewall.conf
```

Now edit exported rules:

```shell
# nano /etc/firewall.conf
# You should end up with something like:
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
# Allow everything on localhost (loopback)
-A INPUT -i lo -j ACCEPT
-A OUTPUT -o lo -j ACCEPT

# Allow all outgoing connections
-A OUTPUT -j ACCEPT

# Allow all active incoming connection to continue
-A INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
# Allow all active outgoing connection to continue
-A OUTPUT -m conntrack --ctstate ESTABLISHED -j ACCEPT
# Drop all INVALID incoming connections
-A INPUT -m conntrack --ctstate INVALID -j DROP

# Main incoming connection rules
-A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
-A INPUT -p tcp -m tcp --dport 80 -j ACCEPT
-A INPUT -p tcp -m tcp --dport 22 -j ACCEPT

# Drop all other incoming connections
-A INPUT -j DROP
# Reject any forwarding
-A FORWARD -j REJECT
COMMIT
```

To test rules run:

```shell
iptables-restore < /etc/firewall.conf
```

To make created rules persistent, create file `/etc/network/if-up.d/firewall`

```shell
#!/bin/sh
iptables-restore < /etc/firewall.conf
```

Make it executable:

```shell
chmod +x /etc/network/if-up.d/firewall
```

## Further reading:

- [Basic ipv6 firewall with `ip6tables`](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/iptables-firewall-ipv6.md)
