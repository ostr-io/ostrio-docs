# Monitoring via SNMP

## Why SNMP?

Monitoring via SNMP is beneficial for double durability. While the server is down, build-in server's tools for notifying the administrator about high server usage, low HDD space, fraud logins, and connectivity issues may not work. With double durability in mind, — [ostr.io service](https://ostr.io) check servers from its end, from outside of local network and infrastructure, independently.

> It's better to receive notifications from multiple sources, than none.

SNMP protocol is capable of collecting data about active SSH sessions and logins, server's uptime, high memory (RAM) and CPU consumption, low storage space, high network traffic.

Sever monitoring requirements via SNMP-endpoint:

- Installed and running SNMPv2c service (*on a server*);
- Public "Community" with random name (*password*).

Collected data and its OIDs (*allow/deny any of list below to fit your needs*):

- Host uptime (`1.3.6.1.2.1.25.1.1.0`)
- SSH logins (`1.3.6.1.2.1.25.1.5.0`)
- System processes (`1.3.6.1.2.1.25.4.2.1.7`)
- System load (`1.3.6.1.4.1.2021.10.1.3`)
- CPU utilization (`1.3.6.1.2.1.25.3.3.1.2`)
- HDD/SSD/RAM/Swap names (`1.3.6.1.2.1.25.2.3.1.3`)
- HDD/SSD/RAM/Swap capacity (`1.3.6.1.2.1.25.2.3.1.5`)
- HDD/SSD/RAM/Swap usage (`1.3.6.1.2.1.25.2.3.1.6`)
- Network Interfaces info (`1.3.6.1.2.1.31.1.1.1`, `1.3.6.1.2.1.2.2.1`)

## Install and configure SNMP

All installation and setup instructions and examples are for Debian/Ubuntu Linux distributions. Instructions for other systems are very similar.

### Installation

```shell
# Install snmpd
apt-get update
apt-get install snmpd

# Edit configuration file:
nano /etc/snmp/snmpd.conf
```

### Configuration

__Do not forget to change value in between `<` and `>` symbols to your own value!__

```bash
# /etc/snmp/snmpd.conf
# Change 161 to any other random port for higher security
agentAddress udp:161,udp6:[::1]:161

#       sec.name        source          community
com2sec ReadUser        default         <password>

#                       sec.model       sec.name
group   ReadGroup       v2c             ReadUser

#                       incl/excl       subtree
view    ReadData        included        .1.3.6.1.2.1.25.1.1.0
view    ReadData        included        .1.3.6.1.2.1.25.1.5.0
view    ReadData        included        .1.3.6.1.2.1.25.4.2.1.7
view    ReadData        included        .1.3.6.1.4.1.2021.10.1.3
view    ReadData        included        .1.3.6.1.2.1.25.3.3.1.2
view    ReadData        included        .1.3.6.1.2.1.25.2.3.1.3
view    ReadData        included        .1.3.6.1.2.1.25.2.3.1.5
view    ReadData        included        .1.3.6.1.2.1.25.2.3.1.6
view    ReadData        included        .1.3.6.1.2.1.31.1.1.1
view    ReadData        included        .1.3.6.1.2.1.2.2.1

#                       context model   level   prefix  read            write   notify
access  ReadGroup       ""      any     noauth  exact   ReadData        none    none
```

### Edit SNMP daemon settings:

```shell
nano /etc/default/snmpd
```

```bash
# /etc/default/snmpd
# This file controls the activity of snmpd
# Don't load any MIBs by default.
#export MIBS=/usr/share/snmp/mibs

# snmpd control (yes means start daemon).
SNMPDRUN=yes

# snmptrapd control (yes means start daemon).
TRAPDRUN=no

# snmpd options
SNMPDOPTS='-Lsd -Lf /dev/null -u snmp -g snmp -I -smux,mteTrigger,mteTriggerConf -p /run/snmpd.pid'
```

### Restart SNMP to apply changes

```shell
service snmpd restart
```

### Check SNMP daemon status

```shell
service snmpd status # should return OK (active (running))
```

## Add SNMP endpoint at [ostr.io](https://ostr.io):

1. Go to [Monitoring](https://ostr.io/service/monitoring)
2. Click on "*Add Endpoint*"
3. To select server type-in its name, and hit <kbd>Enter</kbd>
4. Select "*SNMP*" in "*Protocol*" drop-down list
5. Select desired "*Check Frequency*". We recommend to add same SNMP endpoint twice - one with high frequency (*less than 5 mins*), and second with low frequency (1-4 times per day). This will give the better overview of server resources usage
6. Enter "*SNMP port*" (from `/etc/snmp/snmpd.conf` file)
7. Enter "*SNMP Community*" (a.k.a. `password` from `/etc/snmp/snmpd.conf` file)
8. Click on "*Add*" button
9. Done!
