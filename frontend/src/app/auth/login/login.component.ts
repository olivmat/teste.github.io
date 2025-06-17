import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router) {}

  login() {
    // Simulação de login (substitua por chamada ao backend)
    if (this.username === 'admin' && this.password === 'admin') {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Usuário ou senha inválidos';
    }
  }
} 