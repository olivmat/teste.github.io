import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';
  success: string = '';

  constructor(private router: Router) {}

  register() {
    if (!this.username || !this.password) {
      this.error = 'Preencha todos os campos';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'As senhas não coincidem';
      return;
    }
    // Simulação de cadastro (substitua por chamada ao backend)
    this.success = 'Usuário cadastrado com sucesso!';
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }
} 