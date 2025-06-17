import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PersonModalComponent } from './person-modal/person-modal.component';

@Component({
  selector: 'app-person-form',
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.css']
})
export class PersonFormComponent implements OnInit {
  pessoas: any[] = [];
  pessoasFiltradas: any[] = [];
  buscaNome: string = '';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.carregarPessoas();
  }

  carregarPessoas() {
    this.http.get('http://localhost:8000/people/').subscribe(
      (data: any) => {
        console.log('Pessoas carregadas:', data);
        this.pessoas = data;
        this.filtrarPessoas();
      },
      (error: HttpErrorResponse) => {
        console.error('Erro ao carregar pessoas:', error);
        this.showMessage('Erro ao carregar pessoas', true);
      }
    );
  }

  filtrarPessoas() {
    const termo = this.buscaNome.trim().toLowerCase();
    if (!termo) {
      this.pessoasFiltradas = this.pessoas;
    } else {
      this.pessoasFiltradas = this.pessoas.filter(p => p.name.toLowerCase().startsWith(termo));
    }
  }

  abrirModalCadastro() {
    const dialogRef = this.dialog.open(PersonModalComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarPessoas();
      }
    });
  }

  editarPessoa(pessoa: any) {
    const dialogRef = this.dialog.open(PersonModalComponent, {
      width: '600px',
      data: pessoa
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarPessoas();
      }
    });
  }

  deletePerson(id: number) {
    if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
      this.http.delete(`http://localhost:8000/people/${id}`).subscribe(
        () => {
          this.showMessage('Pessoa excluída com sucesso!');
          this.carregarPessoas();
        },
        (error: HttpErrorResponse) => {
          console.error('Erro ao excluir pessoa:', error);
          this.showMessage('Erro ao excluir pessoa', true);
        }
      );
    }
  }

  private showMessage(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
} 