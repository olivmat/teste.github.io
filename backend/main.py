from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models
from . import schemas
from datetime import date
import logging
from fastapi.staticfiles import StaticFiles
import shutil
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos da pasta uploads
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

# Dependency
def get_db():
    db = models.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def calculate_age(birth_date: date) -> int:
    today = date.today()
    age = today.year - birth_date.year
    if today.month < birth_date.month or (today.month == birth_date.month and today.day < birth_date.day):
        age -= 1
    return age

def get_next_pulseira_numero(db: Session) -> str:
    # Get the last person's pulseira_numero
    last_person = db.query(models.Person).order_by(models.Person.id.desc()).first()
    if last_person and last_person.pulseira_numero:
        # Extract the number from the last pulseira_numero
        try:
            last_num = int(last_person.pulseira_numero.replace('#', ''))
            next_num = last_num + 1
        except ValueError:
            next_num = 1
    else:
        next_num = 1
    
    return f"#{next_num}"

@app.post("/people/", response_model=schemas.Person)
def create_person(person: schemas.PersonCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Recebendo dados para criar pessoa: {person.dict()}")
        # Generate pulseira_numero
        pulseira_numero = get_next_pulseira_numero(db)
        person_data = person.dict()
        person_data['pulseira_numero'] = pulseira_numero
        
        # Calculate age
        person_data['idade'] = calculate_age(person_data['birth_date'])
        
        db_person = models.Person(**person_data)
        db.add(db_person)
        db.commit()
        db.refresh(db_person)
        logger.info(f"Pessoa criada com sucesso: {db_person.id}")
        return db_person
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar pessoa: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/people/", response_model=List[schemas.Person])
def read_people(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        people = db.query(models.Person).offset(skip).limit(limit).all()
        return people
    except Exception as e:
        logger.error(f"Erro ao listar pessoas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/people/{person_id}", response_model=schemas.Person)
def read_person(person_id: int, db: Session = Depends(get_db)):
    try:
        db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
        if db_person is None:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada")
        return db_person
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar pessoa {person_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/people/{person_id}", response_model=schemas.Person)
def update_person(person_id: int, person: schemas.PersonCreate, db: Session = Depends(get_db)):
    try:
        db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
        if db_person is None:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada")
        
        person_data = person.dict()
        # Calculate age
        person_data['idade'] = calculate_age(person_data['birth_date'])
        
        for key, value in person_data.items():
            setattr(db_person, key, value)
        
        db.commit()
        db.refresh(db_person)
        logger.info(f"Pessoa {person_id} atualizada com sucesso")
        return db_person
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar pessoa {person_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/people/{person_id}")
def delete_person(person_id: int, db: Session = Depends(get_db)):
    try:
        db_person = db.query(models.Person).filter(models.Person.id == person_id).first()
        if db_person is None:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada")
        
        db.delete(db_person)
        db.commit()
        logger.info(f"Pessoa {person_id} excluída com sucesso")
        return {"message": "Pessoa removida com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao excluir pessoa {person_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Rotas para Presença
@app.post("/presences/", response_model=schemas.Presence)
def create_presence(presence: schemas.PresenceCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Recebendo dados para criar presença: {presence.dict()}")
        
        # Verificar se a pessoa existe
        db_person = db.query(models.Person).filter(models.Person.id == presence.person_id).first()
        if db_person is None:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada")
        
        # Verificar duplicidade de presença para a mesma pessoa no mesmo dia
        db_presence_existente = db.query(models.Presence).filter(
            models.Presence.person_id == presence.person_id,
            models.Presence.date == presence.date
        ).first()
        if db_presence_existente:
            raise HTTPException(status_code=400, detail="Criança já registrada hoje ⚠️")
        
        # Criar a presença
        db_presence = models.Presence(**presence.dict())
        db.add(db_presence)
        db.commit()
        db.refresh(db_presence)
        
        logger.info(f"Presença criada com sucesso: {db_presence.id}")
        return db_presence
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar presença: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/presences/", response_model=List[schemas.Presence])
def read_presences(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        presences = db.query(models.Presence).offset(skip).limit(limit).all()
        return presences
    except Exception as e:
        logger.error(f"Erro ao listar presenças: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/presences/{presence_id}", response_model=schemas.Presence)
def read_presence(presence_id: int, db: Session = Depends(get_db)):
    try:
        db_presence = db.query(models.Presence).filter(models.Presence.id == presence_id).first()
        if db_presence is None:
            raise HTTPException(status_code=404, detail="Presença não encontrada")
        return db_presence
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar presença {presence_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/presences/{presence_id}")
def delete_presence(presence_id: int, db: Session = Depends(get_db)):
    try:
        db_presence = db.query(models.Presence).filter(models.Presence.id == presence_id).first()
        if db_presence is None:
            raise HTTPException(status_code=404, detail="Presença não encontrada")
        
        db.delete(db_presence)
        db.commit()
        logger.info(f"Presença {presence_id} excluída com sucesso")
        return {"message": "Presença removida com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao excluir presença {presence_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    upload_dir = "backend/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/uploads/{file.filename}"} 