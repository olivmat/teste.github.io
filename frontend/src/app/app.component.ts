import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PresencaCadastroModalComponent } from './presenca/presenca-cadastro-modal/presenca-cadastro-modal.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-menu (registrarPresenca)="abrirModalPresenca()"></app-menu>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    
    main {
      padding: 2rem 0;
    }
  `]
})
export class AppComponent {
  title = 'cadastro-pessoas';

  constructor(public dialog: MatDialog) {}

  abrirModalPresenca() {
    const dialogRef = this.dialog.open(PresencaCadastroModalComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.location.reload();
      }
    });
  }
} 