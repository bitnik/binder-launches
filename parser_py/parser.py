#!/usr/bin/env python3.9
"""Script to parse mybinder launch events."""
import argparse
import json
from datetime import date
from datetime import datetime
from urllib.parse import unquote
from urllib.request import urlopen

from .utils import bulk_insert
from parser_py import logger


def iterate_archives() -> dict:
    """Returns a dict with archive metadata; name, date and count."""
    url = "https://archive.analytics.mybinder.org/index.jsonl"
    index = urlopen(url)
    for archive in index:
        archive = json.loads(archive)
        yield archive


def iterate_launches(archive_name: str) -> dict:
    """Reads an archive from url and returns a launch dict."""
    url = f"https://archive.analytics.mybinder.org/{archive_name}"
    launches = urlopen(url)
    for launch in launches:
        launch = json.loads(launch)
        yield launch


def spec_into_parts(spec: str, provider: str) -> tuple[str, str]:
    """Divides spec into repo and ref.
    Based on https://github.com/gesiscss/binder_gallery/blob/cce79761c4c9f13836e60f823c357a1c2b99463b/binder_gallery/models.py#L173
    """
    if provider in ["GitHub", "Git", "GitLab"]:
        repo, ref = spec.rsplit("/", 1)
        if provider in ["Git", "GitLab"]:
            repo = unquote(repo)
    elif provider == "Gist":
        user_name, gist_id, *ref = spec.split("/", 2)
        repo = f"{user_name}/{gist_id}"
        ref = ref[0] if ref else ""
    elif provider in ["Zenodo", "Figshare", "Dataverse"]:
        repo = spec
        ref = ""
    elif provider == "Hydroshare":
        repo = spec.split("/")[-1].split(".")[-1]
        ref = ""
    return repo, ref


def transform_launch_data(launch: dict) -> dict:
    # timestamp is always in UTC
    launch["timestamp"] = datetime.fromisoformat(launch["timestamp"])
    # origin info is added at 12.06.2019 (version 3)
    if launch["timestamp"].date() <= date(2019, 6, 12):
        launch["origin"] = launch.get("origin", "mybinder.org")
    # ref info is added at 18.06.2020 (version 4)
    if launch["timestamp"].date() <= date(2020, 6, 18):
        launch["resolved_ref"] = launch.get("ref", "")
    else:
        launch["resolved_ref"] = launch["ref"]
    launch["repo"], launch["ref"] = spec_into_parts(launch["spec"], launch["provider"])
    return launch


def parse(since: date, until: date, delete_old: bool = False) -> None:
    for archive in iterate_archives():
        archive_date = datetime.strptime(archive["date"], "%Y-%m-%d").date()
        if since <= archive_date <= until:
            logger.info(f"parsing {archive}")
            launches = []
            for launch in iterate_launches(archive["name"]):
                launches.append(transform_launch_data(launch))
            logger.info(f"{len(launches)=}")
            bulk_insert(launches, delete_old, archive_date)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-s, --since",
        dest="since",
        type=str,
        default="2018-11-03",
        required=False,
        help='Since which date you want to start parsin. Format: "YYYY-MM-SS".',
    )
    parser.add_argument(
        "-u, --until",
        dest="until",
        type=str,
        default=str(date.today()),
        required=False,
        help='Until which date you want to start parsin. Format: "YYYY-MM-SS".',
    )
    args = parser.parse_args()
    since = datetime.strptime(args.since, "%Y-%m-%d").date()
    until = datetime.strptime(args.until, "%Y-%m-%d").date()
    parse(since, until)
