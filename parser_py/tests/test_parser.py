from datetime import date
from datetime import datetime
from datetime import timedelta
from datetime import timezone

import pytest

from ..parser import iterate_archives
from ..parser import iterate_launches
from ..parser import transform_launch_data
from ..utils import bulk_insert
from ..utils import get_launches_count


def test_iterate_archives():
    archives = iterate_archives()
    count = -1  # dont count the first day
    for archive in archives:
        count += 1
        assert "name" in archive
        assert "date" in archive
        # assert "count" in archive
    first_archive_date = date(2018, 11, 3)
    today = first_archive_date + timedelta(days=count)
    assert today == datetime.utcnow().date()


def test_iterate_launches():
    archive_name = "events-2021-03-08.jsonl"
    count = len(list(iterate_launches(archive_name)))
    assert count == 32238


# @pytest.mark.parametrize(
#     "provider,spec,expected_repo,expected_ref",
#     [
#         (
#             "GitHub",
#             "ipython/ipython-in-depth/master",
#             "ipython/ipython-in-depth",
#             "master",
#         ),
#         # 2021-03-11
#         (
#             "GitLab",
#             "DGothrek%2Fipyaggrid/binder-demo",
#             "DGothrek/ipyaggrid",
#             "binder-demo",
#         ),
#         ("Zenodo", "10.22002/d1.1250", "10.22002/d1.1250", ""),
#     ],
# )
# def test_spec_into_parts(provider, spec, expected_repo, expected_ref):
#     repo, ref = spec_into_parts(spec, provider)
#     assert repo == expected_repo
#     assert ref == expected_ref


@pytest.mark.parametrize(
    "launch,transformed_launch",
    [
        (
            {
                "timestamp": "2019-03-08T20:07:00+00:00",
                "schema": "binderhub.jupyter.org/launch",
                "version": 1,
                "provider": "GitHub",
                "spec": "binder-examples/julia-python/master",
                "status": "success",
            },
            {
                "timestamp": datetime(2019, 3, 8, 20, 7, 0, tzinfo=timezone.utc),
                "schema": "binderhub.jupyter.org/launch",
                "version": 1,
                "provider": "GitHub",
                "spec": "binder-examples/julia-python/master",
                "status": "success",
                "origin": "mybinder.org",
                "resolved_ref": "",
                "repo": "binder-examples/julia-python",
                "ref": "master",
            },
        ),
        (
            {
                "timestamp": "2019-04-02T18:11:00+00:00",
                "schema": "binderhub.jupyter.org/launch",
                "version": 2,
                "provider": "Gist",
                "spec": "Markus28/438a1d6603d95f9e16aa121c6d0c56a8/master",
                "status": "success",
            },
            {
                "timestamp": datetime(2019, 4, 2, 18, 11, 0, tzinfo=timezone.utc),
                "schema": "binderhub.jupyter.org/launch",
                "version": 2,
                "provider": "Gist",
                "spec": "Markus28/438a1d6603d95f9e16aa121c6d0c56a8/master",
                "status": "success",
                "origin": "mybinder.org",
                "resolved_ref": "",
                "repo": "Markus28/438a1d6603d95f9e16aa121c6d0c56a8",
                "ref": "master",
            },
        ),
        (
            {
                "timestamp": "2019-06-12T22:37:00+00:00",
                "schema": "binderhub.jupyter.org/launch",
                "version": 3,
                "provider": "GitLab",
                "spec": "pyspc%2Fpyspc/master",
                "status": "success",
                "origin": "gke.mybinder.org",
            },
            {
                "timestamp": datetime(2019, 6, 12, 22, 37, 0, tzinfo=timezone.utc),
                "schema": "binderhub.jupyter.org/launch",
                "version": 3,
                "provider": "GitLab",
                "spec": "pyspc%2Fpyspc/master",
                "status": "success",
                "origin": "gke.mybinder.org",
                "resolved_ref": "",
                "repo": "pyspc/pyspc",
                "ref": "master",
            },
        ),
        (
            {
                "timestamp": "2020-06-18T16:49:00+00:00",
                "schema": "binderhub.jupyter.org/launch",
                "version": 4,
                "provider": "Git",
                "spec": "https:%2F%2Fbitbucket.org%2Ffsmeraldi%2Fjupytermarking%2Fsrc%2Fmaster/master",
                "ref": "d22a4b0a494b25ad9e0397b44d9abc3461eb6309",
                "status": "success",
                "origin": "gke.mybinder.org",
            },
            {
                "timestamp": datetime(2020, 6, 18, 16, 49, 0, tzinfo=timezone.utc),
                "schema": "binderhub.jupyter.org/launch",
                "version": 4,
                "provider": "Git",
                "spec": "https:%2F%2Fbitbucket.org%2Ffsmeraldi%2Fjupytermarking%2Fsrc%2Fmaster/master",
                "status": "success",
                "origin": "gke.mybinder.org",
                "resolved_ref": "d22a4b0a494b25ad9e0397b44d9abc3461eb6309",
                "repo": "https://bitbucket.org/fsmeraldi/jupytermarking/src/master",
                "ref": "master",
            },
        ),
        (
            {
                "timestamp": "2021-03-11T05:17:00+00:00",
                "schema": "binderhub.jupyter.org/launch",
                "version": 4,
                "provider": "Zenodo",
                "spec": "10.5281/zenodo.4032875",
                "ref": "4049787",
                "status": "success",
                "origin": "gke.mybinder.org",
            },
            {
                "timestamp": datetime(2021, 3, 11, 5, 17, 0, tzinfo=timezone.utc),
                "schema": "binderhub.jupyter.org/launch",
                "version": 4,
                "provider": "Zenodo",
                "spec": "10.5281/zenodo.4032875",
                "status": "success",
                "origin": "gke.mybinder.org",
                "resolved_ref": "4049787",
                "repo": "10.5281/zenodo.4032875",
                "ref": "",
            },
        ),
        (
            {
                "timestamp": "2020-06-18T17:21:00+00:00",
                "schema": "binderhub.jupyter.org/launch",
                "version": 4,
                "provider": "Hydroshare",
                "spec": "8f7c2f0341ef4180b0dbe97f59130756",
                "ref": "8f7c2f0341ef4180b0dbe97f59130756.v1587139888",
                "status": "success",
                "origin": "gke.mybinder.org",
            },
            {
                "timestamp": datetime(2020, 6, 18, 17, 21, 0, tzinfo=timezone.utc),
                "schema": "binderhub.jupyter.org/launch",
                "version": 4,
                "provider": "Hydroshare",
                "spec": "8f7c2f0341ef4180b0dbe97f59130756",
                "status": "success",
                "origin": "gke.mybinder.org",
                "resolved_ref": "8f7c2f0341ef4180b0dbe97f59130756.v1587139888",
                "repo": "8f7c2f0341ef4180b0dbe97f59130756",
                "ref": "",
            },
        ),
    ],
)
def test_transform_launch_data(launch, transformed_launch):
    """This test also covers spec_into_parts."""
    launch = transform_launch_data(launch)
    assert launch == transformed_launch


def test_get_launches_count(db_session):
    c = get_launches_count(db_session)
    assert c == 0


def test_bulk_insert(db_session):
    archive_name = "events-2020-03-08.jsonl"
    bulk_data = []
    for launch in iterate_launches(archive_name):
        launch = transform_launch_data(launch)
        bulk_data.append(launch)
    assert len(bulk_data) == 13290
    bulk_insert(bulk_data, session=db_session)

    c = get_launches_count(db_session)
    assert c == 13290


def test_bulk_insert_with_delete(db_session):
    archive_name = "events-2020-03-08.jsonl"
    bulk_data = []
    for launch in iterate_launches(archive_name):
        launch = transform_launch_data(launch)
        bulk_data.append(launch)
    assert len(bulk_data) == 13290
    bulk_insert(bulk_data, session=db_session)

    c = get_launches_count(db_session)
    assert c == 13290

    bulk_insert(
        bulk_data, delete_old=True, delete_date=date(2020, 3, 8), session=db_session
    )

    c = get_launches_count(db_session)
    assert c == 13290
