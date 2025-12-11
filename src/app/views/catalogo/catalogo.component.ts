
import { Component, OnInit } from '@angular/core';
import { JogosService, Jogo } from '../../data/jogos.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router'; 
import { tap } from 'rxjs/operators'; 

import { AuthService } from '../../auth/auth.service'; 

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

  constructor(
    private jogosService: JogosService,
    private router: Router, 
    public authService: AuthService 
  ) { }

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
  
  verDetalhes(jogoId: string | number | undefined): void {
    // Só navega se o ID estiver presente
    if (jogoId !== undefined) {
        // Navega para a página de detalhes do jogo
        this.router.navigate(['/jogo', jogoId]);
    } else {
        console.error("Tentativa de navegação sem ID válido.");
    }
  }
}