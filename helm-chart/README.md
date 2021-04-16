## Prerequisites

First of all you have to [install the TimescaleDB](https://docs.timescale.com/latest/getting-started/installation) and
then [set it up](https://docs.timescale.com/latest/getting-started/setup).

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
# add the binder-launches chart repo
helm repo add binder-launches https://bitnik.github.io/binder-launches/
# update charts
helm repo update
# install
helm upgrade binder-launches binder-launches/binder-launches --version=0.1.3 --install -f config.yaml
```

For more configuration please have a look at [values.yaml](binder-launches/values.yaml).

At [https://bitnik.github.io/binder-launches/](https://bitnik.github.io/binder-launches/) you can find all helm chart releases.
