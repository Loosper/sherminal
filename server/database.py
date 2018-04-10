from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    guid = Column(String(32), primary_key=True)
    term_id = Column(Integer, nullable=True)
    username = Column(String)

    def __repr__(self):
        return "terminal: {}, username: '{}'".format(
            self.term_id, self.username
        )


if __name__ == '__main__':
    from sqlalchemy import create_engine

    engine = create_engine('sqlite:///:memory:', echo=True)
    Base.metadata.create_all(engine)

    # session_maker = sessionmaker(bind=engine)
    # session = session_maker()
    session = sessionmaker(bind=engine)()

    new = User(term_id=1, username='first')
    session.add(new)

    print(session.query(User).first())
