# Monitoring

__Fully SaaS with zero setup__. Get real-time email and SMS alerts for website or server downtime, slow responses, unexpected content changes, SSH logins, and resource spikes. Covers everything from HTTP errors to CPU, RAM, and disk usage

## Intro

Downtime costs revenue. With most business online, rapid detection of server, hardware, and software failures is critical. ostr.io Monitoring provides continuous, real-time oversight with instant alerts and predictive insights—preventing incidents and reducing Mean Time to Repair.

## Supported Protocols

`http` and `https` protocols can be used for availability checks, perfect for API endpoints, websites, and web servers. Although it doesn't require any setup for simple availability monitoring it can be easily extended. If an endpoint returns a response with plain one-level `XML` or `JSON` - first-level numerical options will be parsed with an option to create alert triggers.

`SNMP` protocol more complex and requires additional setup on the server side. It is the industry standard for hardware monitoring. With SNMP we can collect data, monitor and warn about CPU and RAM utilization, storage space, network load, SSH sessions, server reboots, and other critical data.

## Documentation

Learn about Monitoring Service features.

### HTTP and SNMP monitoring

- [Basic HTTP(S) Monitoring](https://github.com/ostr-io/ostrio-docs/blob/master/docs/monitoring/basics.md)
- [HTTP(S) Monitoring with web-authentication](https://github.com/ostr-io/ostrio-docs/blob/master/docs/monitoring/with-auth.md)
- Advanced: [SNMP (CPU, RAM, HDD, SSD, Bandwidth, Processes, SSH Sessions, Server Reboot) monitoring](https://github.com/ostr-io/ostrio-docs/blob/master/docs/monitoring/snmp.md)

### Tutorials and how to's

- [Nginx stats and usage Monitoring](https://github.com/ostr-io/ostrio-docs/blob/master/docs/monitoring/nginx-stats.md)
- [Build "uncacheable" path to endpoint, prevent cached results](https://github.com/ostr-io/ostrio-docs/blob/master/docs/monitoring/custom-path.md)

> [!TIP]
> Use `{{rand}}` placeholder (*including curly brackets*) in endpoint URL to generate unique random URI for every checking request. Note: `{{rand}}` can be used multiple times in a single URL, example: `/path/{{rand}}/part?nc={{rand}}`

## Further reading

- [Learn more about Monitoring Service by ostr.io](https://ostr.io/info/monitoring)

<!--  - Custom: [JSON Endpoint Monitoring]()
 - Custom: [XML Endpoint Monitoring]() -->

<!--  - [Phusion Passenger `passenger-status` Monitoring]()
 - [PHP stats and usage Monitoring]()
 - [Node.js stats and usage Monitoring]()
 - [MongoDB stats and usage Monitoring]()
 - PHP: [MySQL Database Monitoring]()
 - Ruby: [MySQL Database Monitoring]()
 - Node.js: [MySQL Database Monitoring]()
 - PHP: [MongoDB Database Monitoring]()
 - Ruby: [MongoDB Database Monitoring]()
 - Node.js: [MongoDB Database Monitoring]()
 - PHP: [Redis Database Monitoring]()
 - Ruby: [Redis Database Monitoring]()
 - Node.js: [Redis Database Monitoring]()
 - Custom: [Server stats Monitoring with Node.js]()
 - Custom: [Server stats Monitoring with Ruby]()
 - Custom: [Server stats Monitoring with PHP]() -->
