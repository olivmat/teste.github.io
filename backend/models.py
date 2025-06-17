from sqlalchemy import Column, Integer, String, Date, Boolean, create_engine, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

SQLALCHEMY_DATABASE_URL = "sqlite:///./cadastro.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    pulseira_numero = Column(String(20), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    birth_date = Column(Date, nullable=False)
    idade = Column(Integer, nullable=False)
    address = Column(String(200), nullable=False)
    banheiro_sozinho = Column(Boolean, nullable=False, default=False)
    alguma_alergia = Column(Boolean, nullable=False, default=False)
    alergia = Column(String(200), nullable=False, default='-')
    foto = Column(String(15000), nullable=False, default='-')
    presencas = relationship("Presence", back_populates="person")
    responsavel = Column(String(100), nullable=False, default='')
    grau_parentesco = Column(String(50), nullable=False, default='')
    sexo = Column(String(20), nullable=False, default='')

class Presence(Base):
    __tablename__ = "presences"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("people.id"), nullable=False)
    date = Column(Date, nullable=False)
    person = relationship("Person", back_populates="presencas")

# Criar as tabelas
Base.metadata.create_all(bind=engine) 