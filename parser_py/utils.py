import os
from datetime import date
from datetime import timezone
from subprocess import check_call
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy import exc
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker

from .db import Base
from .db import Launch


def make_session(db_url: str, create_all: bool = False, echo: bool = False) -> Session:
    """Returns a database session.
    If create_all is True, it first creates all tables and then returns a session.
    """
    engine = create_engine(db_url, echo=echo)
    if create_all is True:
        Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    return session


# def create_db(db_url):
#     url = make_url(db_url)
#     database = url.database
#     url.database = None
#     session = make_session(url)
#     result = session.execute(f"CREATE DATABASE {database}")
#     return result


def upgrade_db() -> None:
    check_call(
        ["alembic", "upgrade", "head"], cwd=os.path.dirname(os.path.realpath(__file__))
    )


def get_launches_count(
    session: Optional[Session] = None, db_url: Optional[str] = None
) -> int:
    if session is None:
        if db_url is None:
            raise ValueError("session or db_url must be passed.")
        session = make_session(db_url)

    count = session.query(func.count("*")).select_from(Launch).scalar()
    return count


def bulk_insert(
    launches: list[dict],
    delete_old: bool = False,
    delete_date: Optional[date] = None,
    session: Optional[Session] = None,
    db_url: Optional[str] = None,
) -> None:
    if session is None:
        if db_url is None:
            raise ValueError("session or db_url must be passed.")
        session = make_session(db_url)

    if delete_old is True:
        # session.query(Launch).filter(func.date(Launch.timestamp) == str(delete_date)).delete(
        #     synchronize_session=False
        # )
        session.query(Launch).filter(
            Launch.timestamp >= f"{delete_date} 00:00:00+00"
        ).filter(Launch.timestamp <= f"{delete_date} 23:59:59+00").delete(
            synchronize_session=False
        )
        # session.commit()

    # https://docs.sqlalchemy.org/en/13/orm/session_api.html#sqlalchemy.orm.session.Session.bulk_insert_mappings
    session.bulk_insert_mappings(Launch, launches)
    session.commit()


def get_last_launch_timestamp(
    session: Optional[Session] = None, db_url: Optional[str] = None
) -> int:
    if session is None:
        if db_url is None:
            raise ValueError("session or db_url must be passed.")
        session = make_session(db_url)

    try:
        last_launch_timestamp = (
            session.query(Launch.timestamp).order_by(Launch.timestamp.desc()).first()
        )
    except exc.ProgrammingError:
        return None
    if last_launch_timestamp:
        last_launch_timestamp = last_launch_timestamp[0].astimezone(timezone.utc)
    return last_launch_timestamp
