import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-person-modal',
  templateUrl: './person-modal.component.html',
  styleUrls: ['./person-modal.component.css']
})
export class PersonModalComponent implements OnInit {
  personForm: FormGroup;
  isEditing: boolean = false;
  fotoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<PersonModalComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
    this.personForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      birth_date: ['', Validators.required],
      banheiro_sozinho: [false, Validators.required],
      alguma_alergia: [false, Validators.required],
      alergia: [''],
      foto: ['-'],
      address: ['-', Validators.required],
      responsavel: ['', [Validators.required, Validators.minLength(1)]],
      grau_parentesco: ['', [Validators.required, Validators.minLength(1)]],
      sexo: ['', [Validators.required, Validators.minLength(1)]]
    });

    if (data) {
      this.isEditing = true;
      this.personForm.patchValue({
        name: data.name,
        birth_date: new Date(data.birth_date),
        address: data.address,
        banheiro_sozinho: data.banheiro_sozinho,
        alguma_alergia: data.alguma_alergia,
        alergia: data.alergia === '-' ? '' : data.alergia,
        foto: data.foto,
        responsavel: data.responsavel,
        grau_parentesco: data.grau_parentesco,
        sexo: data.sexo
      });
      this.fotoPreview = data.foto && data.foto !== '-' ? data.foto : null;
    }
  }

  ngOnInit(): void {
    this.personForm.get('alguma_alergia')?.valueChanges.subscribe(value => {
      const alergiaControl = this.personForm.get('alergia');
      if (value === true) {
        alergiaControl?.setValidators([Validators.required]);
        alergiaControl?.updateValueAndValidity();
      } else {
        alergiaControl?.clearValidators();
        alergiaControl?.setValue('');
        alergiaControl?.updateValueAndValidity();
      }
    });
  }

  onSubmit() {
    if (this.personForm.invalid) return;
    const formValue = this.personForm.value;
    let birthDate = formValue.birth_date;
    if (birthDate instanceof Date) {
      birthDate = birthDate.toISOString().split('T')[0];
    }
    let alergiaValue = formValue.alergia && formValue.alergia.trim().length > 0 ? formValue.alergia : '';
    if (!formValue.alguma_alergia) {
      alergiaValue = '-';
    }
    let fotoValue = formValue.foto && formValue.foto.trim().length > 0 ? formValue.foto : '-';
    const payload: any = {
      name: (formValue.name || '').trim(),
      birth_date: birthDate,
      alergia: alergiaValue,
      foto: fotoValue,
      address: '-',
      banheiro_sozinho: formValue.banheiro_sozinho === true || formValue.banheiro_sozinho === 'true',
      alguma_alergia: formValue.alguma_alergia === true || formValue.alguma_alergia === 'true',
      responsavel: formValue.responsavel,
      grau_parentesco: formValue.grau_parentesco,
      sexo: formValue.sexo
    };
    if (this.isEditing && this.data && this.data.pulseira_numero) {
      payload.pulseira_numero = this.data.pulseira_numero;
    }
    if (!payload.name || payload.name.length < 1) {
      this.snackBar.open('O nome é obrigatório e deve ter pelo menos 1 caractere.', 'Fechar', { duration: 4000 });
      return;
    }
    this.savePerson(payload);
  }

  savePerson(payload: any) {
    if (this.isEditing) {
      this.http.put(`http://localhost:8000/people/${this.data.id}`, payload).subscribe(
        response => {
          console.log('Pessoa atualizada com sucesso:', response);
          this.showMessage('Pessoa atualizada com sucesso!');
          this.dialogRef.close(true);
        },
        (error: HttpErrorResponse) => {
          console.error('Erro ao atualizar pessoa:', error);
          let errorMessage = 'Erro ao atualizar pessoa';
          if (error.error && error.error.detail) {
            if (Array.isArray(error.error.detail)) {
              errorMessage += ': ' + error.error.detail.map((err: any) => err.msg).join(', ');
            } else {
              errorMessage += ': ' + error.error.detail;
            }
          }
          this.showMessage(errorMessage, true);
        }
      );
    } else {
      this.http.post('http://localhost:8000/people/', payload).subscribe(
        response => {
          console.log('Pessoa cadastrada com sucesso:', response);
          this.showMessage('Pessoa cadastrada com sucesso!');
          this.dialogRef.close(true);
        },
        (error: HttpErrorResponse) => {
          console.error('Erro ao cadastrar pessoa:', error);
          let errorMessage = 'Erro ao cadastrar pessoa';
          if (error.error && error.error.detail) {
            if (Array.isArray(error.error.detail)) {
              errorMessage += ': ' + error.error.detail.map((err: any) => err.msg).join(', ');
            } else {
              errorMessage += ': ' + error.error.detail;
            }
          }
          this.showMessage(errorMessage, true);
        }
      );
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  private showMessage(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  onFotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      this.http.post<{ url: string }>('http://localhost:8000/upload/', formData).subscribe({
        next: (res) => {
          this.fotoPreview = 'http://localhost:8000' + res.url;
          this.personForm.patchValue({ foto: this.fotoPreview });
        },
        error: () => {
          this.snackBar.open('Erro ao fazer upload da foto', 'Fechar', { duration: 4000 });
        }
      });
    }
    // Reset the input value so the same file can be selected again
    input.value = '';
  }

  removeFoto() {
    this.fotoPreview = null;
    this.personForm.patchValue({ foto: '-' });
  }
} 