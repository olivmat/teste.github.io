# Cadastro de Pessoas

Aplicação web para cadastro de pessoas com frontend em Angular e backend em Python.

## Backend Setup

1. Crie um ambiente virtual Python:
```bash
python -m venv venv
```

2. Ative o ambiente virtual:
- Windows:
```bash
.\venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Execute o servidor:
```bash
uvicorn backend.main:app --reload
```

## Frontend Setup

1. Instale o Angular CLI globalmente:
```bash
npm install -g @angular/cli
```

2. Navegue até a pasta frontend:
```bash
cd frontend
```

3. Instale as dependências:
```bash
npm install
```

4. Execute o servidor de desenvolvimento:
```bash
ng serve
```

A aplicação estará disponível em:
- Frontend: http://localhost:4200
- Backend: http://localhost:8000
- API Documentation: http://localhost:8000/docs 