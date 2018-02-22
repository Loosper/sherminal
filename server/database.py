from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    term_id = Column(Integer, primary_key=True)
    username = Column(String)

    def __repr__(self):
        pass


if __name__ == '__main__':
    from sqlalchemy import create_engine

    engine = create_engine('sqlite:///:memory:', echo=True)
    Base.metadata.create_all(engine)
