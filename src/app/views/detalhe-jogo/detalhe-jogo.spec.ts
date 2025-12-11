
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { JogosService, Jogo } from '../../data/jogos.service';
import { RevisoesService, Revisao } from '../../data/revisoes.service';
import { Observable, switchMap, tap, map } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalhe-jogo',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './detalhe-jogo.component.html',
  styleUrls: ['./detalhe-jogo.component.css']
})
export class DetalheJogoComponent implements OnInit {
  
  jogo$: Observable<Jogo | undefined> | undefined;
  revisoes$: Observable<Revisao[]> | undefined;
  
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private jogosService: JogosService,
    private revisoesService: RevisoesService
  ) { }

  ngOnInit(): void {
    this.carregarDetalhes();
  }

  carregarDetalhes(): void {
    this.loading = true;
    this.errorMessage = null;

    // obtem o ID do jogo a partir dos parâmetros da rota
    this.jogo$ = this.route.params.pipe(
      map(params => params['id'] as string), // Mapeia o parâmetro 'id'
      
      // Garante que a consulta só é feita se houver um ID.
      switchMap(jogoId => {
        if (!jogoId) {
          this.errorMessage = 'ID do jogo não fornecido na rota.';
          this.loading = false;
          return [undefined]; 
        }
        
        this.revisoes$ = this.revisoesService.getRevisoesPorJogo(jogoId).pipe(
          tap({ error: (err) => console.error("Erro ao carregar revisões:", err) })
        );

        // Carrega os detalhes do jogo
        return this.jogosService.getJogo(jogoId).pipe(
          tap({
            next: () => this.loading = false,
            error: (err) => {
              this.errorMessage = 'Jogo não encontrado ou erro de servidor.';
              this.loading = false;
              console.error(err);
            }
          })
        );
      })
    );
  }
}