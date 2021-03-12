
## Dev

First of all create a virtual env with min Python 3.9 and
then install the requirements:

```bash
pip install -r dev_requirements.txt
# install the git hook scripts
pre-commit install
# now pre-commit will run automatically on git commit
# to run pre-commit against all the files manually: pre-commit run --all-files
```

[Install the TimescaleDB](https://docs.timescale.com/latest/getting-started/installation) and
then [set it up](https://docs.timescale.com/latest/getting-started/setup).

Configuration file for parser should be created under `parser_py` directory.
Here is the rough explanation of the configuration:

```ini
[default]
# default is false
debug =

[database]
# database url is required
url = postgresql+psycopg2://username:password@host:port/database
# run database upgrade (migration) or not. default is true
upgrade =
# interval in event time that each chunk covers. default is 1 month
chunk_time_interval =
# interval for data retention. default is 12 months
data_retention_interval =

[parser]
# start date to parse. default is 2018-11-03
since =
# end date for parsing. default is date of previous day.
until =
# to continue parsing after parsing given range or not. default is true
continuous =
```

For example if you want to parse launch events from 01.01.2021 until 31.03.2021
with chunk interval of 1 week and with data retention of 3 months and
you don't want to continue parsing for dates later than 31.03.2021:

```ini
[default]
debug = true

[database]
url = postgresql+psycopg2://username:password@host:port/database
upgrade = true
chunk_time_interval = 1 week
data_retention_interval = 3 months

[parser]
since = 2021-01-01
until = 2021-03-31
continuous = false
```

To run parser with default config:

```python
python -m parser_py
```

To run tests:

```bash
python -m pytest parser_py/tests/ -v
python -m pytest --cov=parser_py parser_py/tests/ -v
```
