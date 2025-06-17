import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { PresencaCadastroModalComponent } from './presenca-cadastro-modal/presenca-cadastro-modal.component';

@Component({
  selector: 'app-presenca',
  templateUrl: './presenca.component.html',
  styleUrls: ['./presenca.component.css']
})
export class PresencaComponent implements OnInit {
  @ViewChild(MatTable) table!: MatTable<any>;
  
  presencas: any[] = [];
  pessoas: any[] = [];
  displayedColumns: string[] = ['person_id', 'date', 'actions'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.carregarPresencas();
    this.carregarPessoas();
  }

  carregarPresencas() {
    this.http.get('http://localhost:8000/presences/').subscribe(
      (data: any) => {
        console.log('Presenças carregadas:', data);
        this.presencas = data;
        if (this.table) {
          this.table.renderRows();
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Erro ao carregar presenças:', error);
        this.showMessage('Erro ao carregar presenças', true);
      }
    );
  }

  carregarPessoas() {
    this.http.get('http://localhost:8000/people/').subscribe(
      (data: any) => {
        console.log('Pessoas carregadas:', data);
        this.pessoas = data;
      },
      (error: HttpErrorResponse) => {
        console.error('Erro ao carregar pessoas:', error);
        this.showMessage('Erro ao carregar pessoas', true);
      }
    );
  }

  abrirModalPresenca() {
    const dialogRef = this.dialog.open(PresencaCadastroModalComponent, {
      width: '800px',
      data: { pessoas: this.pessoas, presencas: this.presencas }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarPresencas();
      }
    });
  }

  deletePresenca(id: number) {
    if (confirm('Tem certeza que deseja excluir esta presença?')) {
      this.http.delete(`http://localhost:8000/presences/${id}`).subscribe(
        () => {
          this.showMessage('Presença excluída com sucesso!');
          this.carregarPresencas();
        },
        (error: HttpErrorResponse) => {
          console.error('Erro ao excluir presença:', error);
          this.showMessage('Erro ao excluir presença', true);
        }
      );
    }
  }

  getNomePessoa(pessoaId: number): string {
    const pessoa = this.pessoas.find(p => p.id === pessoaId);
    return pessoa ? pessoa.name : 'Pessoa não encontrada';
  }

  getPessoa(pessoaId: number): any {
    return this.pessoas.find(p => p.id === pessoaId);
  }

  logPessoas() {
    console.log('Pessoas carregadas no componente principal:', this.pessoas);
  }

  private showMessage(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }
} 