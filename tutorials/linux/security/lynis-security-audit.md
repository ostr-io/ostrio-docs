# Security audit with Lynis

Lynis is an open source security auditing tool. Lynis is light-weight and easy to use.

## References:

- [Official project page](https://cisofy.com/lynis/)
- [GitHub project page](https://github.com/CISOfy/Lynis)

## Installation

Although Lynis is available in most of Linux package managers - its installation is not required, as it written in shell script.

Download script (clone from github):

```shell
git clone https://github.com/CISOfy/lynis
```

Go to cloned directory:

```shell
cd lynis/
```

## Run script:

```shell
./lynis audit system
```

### To run security audit against docker, run:

```shell
lynis audit dockerfile <path/to/docker>
```

## Further reading:

- [Use RKHunter (Rootkit Hunter) to scan OS for vulnerabilities](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/rootkit-hunter.md)
- [Basic firewall with `iptables`](https://github.com/ostr-io/ostrio-docs/blob/master/tutorials/linux/security/iptables-firewall.md)
