import configparser
import logging
import os
from datetime import date
from datetime import datetime

from .utils import get_last_launch_timestamp

logger = logging.getLogger(__name__)
settings = {}


def load_settings() -> dict:
    parser_config = os.path.join(
        os.path.dirname(os.path.realpath(__file__)), "parser.ini"
    )
    if not os.path.exists(parser_config):
        raise FileNotFoundError("Config file `parser.ini` not found.")
    config = configparser.ConfigParser()
    config.read(parser_config)

    # default
    if "debug" in config["default"]:
        debug = config["default"].getboolean("debug")
    else:
        debug = False

    logging.basicConfig(
        level=logging.DEBUG if debug is True else logging.WARNING,
        format="[%(asctime)s] - %(name)s - %(levelname)s in %(module)s: %(message)s",
    )
    logger.debug(f"{debug=}")

    # database
    db_url = os.getenv("DB_URL", config["database"]["url"])
    # if first time, upgrade must be True
    if "upgrade" in config["database"]:
        db_upgrade = config["database"].getboolean("upgrade")
    else:
        db_upgrade = True
    chunk_time_interval = config["database"]["chunk_time_interval"] or "1 month"
    data_retention_interval = (
        config["database"]["data_retention_interval"] or "12 months"
    )
    logger.debug(f"{db_upgrade=}, {chunk_time_interval=}, {data_retention_interval=}")

    # parser
    # to delete the old data of each archive if there is any before inserting new data
    if "delete_old" in config["parser"]:
        delete_old = config["parser"].getboolean("delete_old")
    else:
        delete_old = False
    last_launch_timestamp = get_last_launch_timestamp(db_url=db_url)
    since = config["parser"]["since"] or last_launch_timestamp or "2018-11-03"
    if type(since) == datetime:
        # since is last_launch_timestamp
        since = since.date()
        delete_old = True
    else:
        since = datetime.strptime(since, "%Y-%m-%d").date()
    until = config["parser"]["until"] or str(date.today())
    until = datetime.strptime(until, "%Y-%m-%d").date()
    if until > date.today():
        raise ValueError(f"Until date ({until}) can't be after today's date.")
    if since > until:
        raise ValueError(f"Since date ({since}) can't be after until date ({until}).")
    # to parse continuously every hour
    # first time run with false, when first huge parsing finishes, then re-deploy with true
    if "continuous" in config["parser"]:
        continuous = config["parser"].getboolean("continuous")
    else:
        continuous = False
    logger.debug(f"{since=}, {until=}, {delete_old=}, {continuous=}")

    settings.update(
        {
            "debug": debug,
            "db_url": db_url,
            "db_upgrade": db_upgrade,
            "chunk_time_interval": chunk_time_interval,
            "data_retention_interval": data_retention_interval,
            "since": since,
            "until": until,
            "delete_old": delete_old,
            "continuous": continuous,
            "logger": logger,
        }
    )
    return settings
