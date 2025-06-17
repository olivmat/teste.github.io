import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-presenca-cadastro-modal',
  templateUrl: './presenca-cadastro-modal.component.html',
  styleUrls: ['./presenca-cadastro-modal.component.css']
})
export class PresencaCadastroModalComponent implements OnInit {
  presencaForm: FormGroup;
  pessoas: any[] = [];
  pessoasFiltradas: any[] = [];
  buscaNome: string = '';
  pessoaSelecionada: any = null;
  today: Date = new Date();
  presencas: any[] = [];
  showErrorModal: boolean = false;
  errorMessage: string = '';

  constructor(
    private dialogRef: MatDialogRef<PresencaCadastroModalComponent>,
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.presencaForm = this.fb.group({
      person_id: ['', Validators.required],
      date: [new Date(), Validators.required]
    });
    if (data && data.presencas) {
      this.presencas = data.presencas;
    }
  }

  ngOnInit(): void {
    this.http.get('http://localhost:8000/people/').subscribe((data: any) => {
      this.pessoas = data;
      this.filtrarPessoas();
    });
  }

  filtrarPessoas() {
    const termo = this.buscaNome.trim().toLowerCase();
    if (!termo) {
      this.pessoasFiltradas = this.pessoas;
    } else {
      this.pessoasFiltradas = this.pessoas.filter(p => p.name.toLowerCase().startsWith(termo));
    }
  }

  selecionarPessoa(pessoa: any) {
    this.pessoaSelecionada = pessoa;
    this.presencaForm.patchValue({ person_id: pessoa.id });
  }

  onSubmit() {
    console.log('onSubmit chamado', this.presencaForm.value, this.pessoaSelecionada);
    if (this.presencaForm.valid) {
      const presencaData = this.presencaForm.value;
      const dataHoje = this.formatarData(presencaData.date);
      const jaRegistrada = this.presencas.some(p =>
        p.person_id === presencaData.person_id &&
        this.formatarData(p.date) === dataHoje
      );
      if (jaRegistrada) {
        this.errorMessage = 'Já foi registrada a presença dessa criança hoje';
        this.showErrorModal = true;
        return;
      }
      this.http.post('http://localhost:8000/presences/', {
        person_id: presencaData.person_id,
        date: dataHoje
      }).subscribe(
        response => {
          this.presencas.push({
            person_id: presencaData.person_id,
            date: dataHoje
          });
          this.dialogRef.close(true);
        },
        error => {
          this.errorMessage = 'Criança já registrada hoje ⚠️';
          this.showErrorModal = true;
        }
      );
    }
  }

  formatarData(date: any): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  }

  onCancel() {
    this.dialogRef.close();
  }

  closeErrorModal() {
    this.showErrorModal = false;
  }
} 