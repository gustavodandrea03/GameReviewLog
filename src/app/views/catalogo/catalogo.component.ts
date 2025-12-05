import { Component, OnInit } from '@angular/core';
import { JogosService, Jogo } from '../../data/jogos.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';
import { tap } from 'rxjs/operators'; 

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'] 
})
export class CatalogoComponent implements OnInit {
  
  jogos$: Observable<Jogo[]> | undefined;
  loading = true;
  errorMessage: string | null = null;

  constructor(private jogosService: JogosService) { }

  ngOnInit(): void {
    this.carregarJogos();
  }

  carregarJogos(): void {
    this.loading = true;
    this.errorMessage = null;

    this.jogos$ = this.jogosService.getTodosJogos().pipe(
      tap({
        next: () => this.loading = false,
        error: (err: any) => { 
          console.error("Erro ao carregar jogos:", err);
          this.errorMessage = 'Falha ao carregar o catálogo de jogos.';
          this.loading = false;
        }
      })
    );
  }
}