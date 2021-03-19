import pytest

from ..utils import make_session


@pytest.fixture
def db_session():
    db_url = "sqlite:///:memory:"
    session = make_session(db_url, create_all=True, echo=True)
    yield session
    session.close()


# @pytest.fixture
# def bulk_data():
#     return [
#         {
#             "timestamp": datetime.fromisoformat("2021-03-04T00:00:00+00:00"),
#             "schema": "binderhub.jupyter.org/launch",
#             "version": 4,
#             "provider": "GitHub",
#             "repo": "RasaHQ/rasa_core",
#             "ref": "0.13.x",
#             "resolved_ref": "85f59f3a645750f67a4a231dd422de1d0a2766f3",
#             "status": "success",
#             "origin": "ovh.mybinder.org"
#             },
#         {
#             "timestamp": datetime.fromisoformat("2019-06-28T17:24:00+00:00"),
#             "schema": "binderhub.jupyter.org/launch",
#             "version": 3,
#             "provider":
#             "Zenodo",
#             "repo": "10.22002/d1.1250",
#             "ref": "",
#             "resolved_ref": "",
#             "status": "success",
#             "origin": "gke.mybinder.org"
#             }
#     ]
