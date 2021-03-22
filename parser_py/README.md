## Local development

1. First of all you have to [install the TimescaleDB](https://docs.timescale.com/latest/getting-started/installation) and
then [set it up](https://docs.timescale.com/latest/getting-started/setup).
Note that setting default timezone in PostgreSQL to UTC would be useful for this application: `SET TIME ZONE 'UTC';`

2. Then create a virtual env with min Python 3.9 and
then install the requirements:

```bash
pip install -r dev_requirements.txt
# install the git hook scripts
pre-commit install
# now pre-commit will run automatically on git commit
# to run pre-commit against all the files manually: pre-commit run --all-files
```

3. Create a configuration file `parser.ini` for the parser under `parser_py` directory.
Note that you should at least set the database url there.
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
# following 2 configs are effective only at first setup
# interval in event time that each chunk covers. default is 1 month
chunk_time_interval =
# interval for data retention. default is 12 months
data_retention_interval =

[parser]
# start date to parse. default is date of last launcn in db or 2018-11-03
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

4. run the parser:

```python
python -m parser_py
```

### Tests

If you want to run tests locally, simply run:

```bash
python -m pytest parser_py/tests/ -v
# or for coverage
python -m pytest --cov=parser_py parser_py/tests/ -v
```

### Timescale Database

Commands to [create a database and initilize the timescaledb extension](https://docs.timescale.com/latest/getting-started/setup):

```sql
-- to get the current timezone setting
SELECT * FROM pg_timezone_names WHERE name = current_setting('TIMEZONE');
-- to set the timezone to UTC
SET TIME ZONE 'UTC';

CREATE DATABASE binderevent;
\c binderevent
CREATE EXTENSION IF NOT EXISTS timescaledb;
-- list extensions
\dx
```

#### Migrations

If you want to manage migrations, here are some example commands:

```bash
cd parser_py/
# create a migration
alembic revision --autogenerate -m "Added launch table"

# upgrade to most recent revison
alembic upgrade head

alembic current
alembic history --verbose
# to downgrade to base
alembic downgrade base
# to downgrade to 1 rev before
alembic downgrade -1
```
