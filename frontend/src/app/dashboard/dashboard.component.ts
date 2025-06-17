import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { PersonModalComponent } from '../person-form/person-modal/person-modal.component';
import { PersonFormComponent } from '../person-form/person-form.component';
import { PresencaCadastroModalComponent } from '../presenca/presenca-cadastro-modal/presenca-cadastro-modal.component';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

interface Crianca {
  id: number;
  nome: string;
  idade: number;
  dataNascimento: string;
  responsavel: string;
  telefone: string;
  endereco: string;
  numeroPulseira: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  totalCriancas: number = 0;
  presentesUltimoDia: number = 0;
  quantidade2a6: number = 0;
  quantidade7a11: number = 0;
  pessoas: any[] = [];
  presencas: any[] = [];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getTotalCriancas();
    this.getPresentesUltimoDia();
    this.getPessoasEPresencas();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderizarGraficoPresencasPorDia(), 500);
  }

  abrirModalCadastro() {
    const dialogRef = this.dialog.open(PersonModalComponent, {
      width: '600px',
      maxWidth: '95%',
      minHeight: '78%',
      maxHeight: '90%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTotalCriancas();
        this.getPresentesUltimoDia();
        this.getPessoasEPresencas();
      }
    });
  }

  abrirModalPresenca() {
    const dialogRef = this.dialog.open(PresencaCadastroModalComponent, {
      width: '900px',
      height: '530px',
      minHeight: '88%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTotalCriancas();
        this.getPresentesUltimoDia();
        this.getPessoasEPresencas();
      }
    });
  }

  getTotalCriancas() {
    this.http.get<any[]>('http://localhost:8000/people/').subscribe(data => {
      this.totalCriancas = data.length;
    });
  }

  getPresentesUltimoDia() {
    this.http.get<any[]>('http://localhost:8000/presences/').subscribe(data => {
      if (data.length === 0) {
        this.presentesUltimoDia = 0;
        return;
      }
      // Encontrar a data mais recente
      const datas = data.map(p => p.date);
      const ultimaData = datas.sort().reverse()[0];
      // Contar quantos presentes na última data
      this.presentesUltimoDia = data.filter(p => p.date === ultimaData).length;
    });
  }

  getPessoasEPresencas() {
    this.http.get<any[]>('http://localhost:8000/people/').subscribe(pessoas => {
      this.pessoas = pessoas;
      this.http.get<any[]>('http://localhost:8000/presences/').subscribe(presencas => {
        this.presencas = presencas;
        this.calcularFaixasEtarias();
        this.renderizarGraficoPresencasPorDia();
      });
    });
  }

  calcularFaixasEtarias() {
    if (!this.presencas.length) {
      this.quantidade2a6 = 0;
      this.quantidade7a11 = 0;
      return;
    }
    // Descobrir a data mais recente
    const datas = this.presencas.map(p => p.date);
    const ultimaData = datas.sort().reverse()[0];
    // Filtrar presenças do último dia
    const presencasUltimoDia = this.presencas.filter(p => p.date === ultimaData);
    // Contar por faixa etária
    let count2a6 = 0;
    let count7a11 = 0;
    presencasUltimoDia.forEach(presenca => {
      const pessoa = this.pessoas.find(p => p.id === presenca.person_id);
      if (pessoa && pessoa.idade !== undefined && pessoa.idade !== null) {
        if (pessoa.idade >= 2 && pessoa.idade <= 6) count2a6++;
        if (pessoa.idade >= 7 && pessoa.idade <= 11) count7a11++;
      }
    });
    this.quantidade2a6 = count2a6;
    this.quantidade7a11 = count7a11;
  }

  renderizarGraficoPresencasPorDia() {
    if (!this.presencas || this.presencas.length === 0) return;
    // Agrupar presenças por data e faixa etária
    const presencasPorData: { [data: string]: { faixa2a6: number, faixa7a11: number } } = {};
    this.presencas.forEach(p => {
      const pessoa = this.pessoas.find(per => per.id === p.person_id);
      if (!pessoa || pessoa.idade === undefined || pessoa.idade === null) return;
      if (!presencasPorData[p.date]) presencasPorData[p.date] = { faixa2a6: 0, faixa7a11: 0 };
      if (pessoa.idade >= 2 && pessoa.idade <= 6) presencasPorData[p.date].faixa2a6++;
      if (pessoa.idade >= 7 && pessoa.idade <= 11) presencasPorData[p.date].faixa7a11++;
    });
    const labels = Object.keys(presencasPorData).sort();
    const data2a6 = labels.map(date => presencasPorData[date].faixa2a6);
    const data7a11 = labels.map(date => presencasPorData[date].faixa7a11);
    const ctx = (document.getElementById('presencasPorDiaChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '2 a 6 anos',
            data: data2a6,
            backgroundColor: 'rgba(85, 255, 7, 0.56)',
            borderColor: 'rgba(148, 233, 69, 0.69)',
            borderWidth: 1
          },
          {
            label: '7 a 11 anos',
            data: data7a11,
            backgroundColor: 'rgba(30, 136, 229, 0.7)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 30
          }
        },
        plugins: {
          legend: { display: true, position: 'bottom' },
          datalabels: {
            anchor: 'end',
            align: 'start',
            color: '#222',
            font: { weight: 'bold', size: 14 },
            offset: 4,
            formatter: function(value: any) { return value; }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Data' },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            title: { display: false },
            ticks: { display: false },
            grid: { display: false },
            border: { display: false }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }
} 