"""Here are database table classes defined with SQLAlchemy ORM.
"""
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Index
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.ext.declarative import declarative_base


PROVIDERS: "name: prefix" = {
    "Git": "git",
    "Gist": "gist",
    "GitHub": "gh",
    "GitLab": "gl",
    "Zenodo": "zenodo",
    "Figshare": "figshare",
    "Hydroshare": "hydroshare",
    "Dataverse": "dataverse",
}

Base = declarative_base()


class Launch(Base):
    """Table for MyBinder launch events
    - https://archive.analytics.mybinder.org/
    - https://binderhub.readthedocs.io/en/latest/eventlogging.html
    """

    __tablename__ = "launches"
    # this is a fake primary key for sqlalchemy only, it doesnt exist in db
    id = Column(Integer, primary_key=True)

    timestamp = Column(DateTime, nullable=False)
    provider = Column(String, nullable=False)

    spec = Column(String, nullable=False)
    namespace = Column(String, nullable=False)
    ref = Column(String, nullable=False)  # unresolved ref

    resolved_ref = Column(String, nullable=False)  # ref in archives
    origin = Column(String, nullable=False)

    schema = Column(String, nullable=False)
    version = Column(Integer, nullable=False)
    status = Column(String, nullable=False)

    __table_args__ = (
        Index("launches_timestamp_idx", timestamp.desc()),
        Index("launches_provider_idx", provider),
        Index("launches_namespace_idx", namespace),
        Index("launches_origin_idx", origin),
        Index("launches_repo_idx", provider, namespace),
    )

    def __repr__(self):
        return f"<Launch({self.provider=}, {self.namespace=}, {self.timestamp=})>"

    @property
    def provider_prefix(self) -> str:
        return PROVIDERS[self.provider]
