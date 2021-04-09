## Prerequisites

First of all you have to [install the TimescaleDB](https://docs.timescale.com/latest/getting-started/installation) and
then [set it up](https://docs.timescale.com/latest/getting-started/setup).
Note that you also have to set default timezone to 'UTC' of PostgreSQL in `postgresql.conf`.

## Installation

First create a config.yaml

```yaml
db:
  # NOTE: put db information into a secret file
  username:
  password:
  host:
  port:
  database:

  # if you install the chart for the first time set `upgrade` to true
  upgrade: true
```

Then install with

```bash
helm install binder-launches ./binder-launches -f config.yaml
```

For more configuration please have a look at [values.yaml](binder-launches/values.yaml).
