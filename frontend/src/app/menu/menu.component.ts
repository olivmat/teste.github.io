import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PersonModalComponent } from '../person-form/person-modal/person-modal.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  @Output() registrarPresenca = new EventEmitter<void>();
  constructor(private dialog: MatDialog) {}

  abrirModalCadastro() {
    const dialogRef = this.dialog.open(PersonModalComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.location.reload();
      }
    });
  }

  abrirModalPresenca() {
    this.registrarPresenca.emit();
  }
} 