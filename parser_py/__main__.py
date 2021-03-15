from datetime import datetime
from datetime import timedelta
from time import sleep
from time import time

from .parser import parse
from .utils import upgrade_db
from parser_py import continuous
from parser_py import db_upgrade
from parser_py import logger
from parser_py import since
from parser_py import until

if __name__ == "__main__":
    if db_upgrade:
        logger.info("Upgrading database")
        upgrade_db()

    delete_old = False
    while True:
        logger.debug(f"parse: {since=}, {until=}, {delete_old=}")
        parse(since, until, delete_old)
        if continuous:
            delete_old = True
            now = datetime.utcnow()
            days_diff = (now.date() - until).days
            if days_diff > 0:
                today_00 = datetime.combine(now.date(), datetime.min.time())
                seconds_diff = (now - today_00).seconds
                if seconds_diff < 7200:
                    # it is before 2 am, sleep until 2 am [UTC]
                    # so we ensure that yesterday's archive is complete
                    since = until
                    logger.info("Sleeping until 2 am [UTC]")
                    sleep(7200 - seconds_diff)
                else:
                    since = until + timedelta(1)
                until = now.date()
            else:
                # sleep until beginning of next hour
                seconds = 3600 - time() % 3600
                logger.info(f"Sleeping {seconds} seconds")
                sleep(seconds)
                since = now.date()
                until = now.date()
        else:
            break
