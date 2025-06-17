from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class PersonBase(BaseModel):
    pulseira_numero: Optional[str] = Field(None, min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=100)
    birth_date: date
    idade: Optional[int] = None
    address: str = Field(..., min_length=1, max_length=200)
    banheiro_sozinho: bool
    alguma_alergia: bool
    alergia: str = Field(..., min_length=1, max_length=200)
    foto: str = Field(..., min_length=1, max_length=5000)
    responsavel: str = Field(..., min_length=1, max_length=100)
    grau_parentesco: str = Field(..., min_length=1, max_length=50)
    sexo: str = Field(..., min_length=1, max_length=20)

class PersonCreate(PersonBase):
    pass

class Person(PersonBase):
    id: int

    class Config:
        from_attributes = True

class PresenceBase(BaseModel):
    person_id: int = Field(..., gt=0)
    date: date

class PresenceCreate(PresenceBase):
    pass

class Presence(PresenceBase):
    id: int
    person: Person

    class Config:
        from_attributes = True 