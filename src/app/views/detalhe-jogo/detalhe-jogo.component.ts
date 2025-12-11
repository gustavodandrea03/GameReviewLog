
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router'; 
import { JogosService, Jogo } from '../../data/jogos.service';
import { RevisoesService, Revisao } from '../../data/revisoes.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Observable, switchMap, tap, map, catchError, of, merge, delay } from 'rxjs'; 
import { RefreshService } from '../../core/refresh.service'; 
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; 

interface RevisaoComUrl extends Revisao {
  screenshot_public_url?: SafeUrl;
}

@Component({
  selector: 'app-detalhe-jogo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalhe-jogo.component.html',
  styleUrls: ['./detalhe-jogo.component.css']
})
export class DetalheJogoComponent implements OnInit {

  jogo$: Observable<Jogo | undefined> | undefined;
  revisoes$: Observable<RevisaoComUrl[]> | undefined;
  
  currentUserId: string | null = null; 

  loading = true;
  errorMessage: string | null = null;
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogosService: JogosService,
    private revisoesService: RevisoesService,
    private authService: AuthService,
    private refreshService: RefreshService,
    private sanitizer: DomSanitizer 
  ) { }

  ngOnInit(): void {
  
    const routeAndRefreshTrigger$ = merge(
      this.route.params.pipe(map(params => params['id'] as string)),
      this.refreshService.refreshNeeded$.pipe(
        switchMap(() => this.route.params.pipe(map(params => params['id'] as string)))
      )
    );

    this.jogo$ = this.authService.currentUser$.pipe(
        delay(0), 
        tap(user => {
            this.currentUserId = user ? user.id : null; 
        }),
        switchMap(() => routeAndRefreshTrigger$),
        switchMap((jogoId: string) => {
            if (!jogoId) {
                this.errorMessage = 'ID do jogo não fornecido.';
                this.loading = false;
                return of(undefined);
            }

            // Carrega e mapeia as revisões (usando URL DIRETA do BD)
            this.revisoes$ = this.revisoesService.getRevisoesPorJogo(jogoId).pipe(
                map((revisoes: Revisao[]) => {
                    return revisoes.map(revisao => {
                        const revisaoComUrl: RevisaoComUrl = { ...revisao };
                        
                        if (revisao.screenshot_url && revisao.screenshot_url !== 'placeholder.txt') {
                            revisaoComUrl.screenshot_public_url = 
                                this.sanitizer.bypassSecurityTrustUrl(revisao.screenshot_url);
                        }
                        return revisaoComUrl;
                    });
                }),
                catchError((err: any) => {
                    console.error("Erro ao carregar revisões:", err);
                    return of([]);
                })
            );
            
            // Carrega os detalhes do jogo
            return this.jogosService.getJogo(jogoId).pipe(
                tap((jogo) => {
                    this.loading = false;
                    // Verifica se o usuário atual é o dono do jogo
                    if (jogo) {
                        this.isOwner = this.currentUserId === jogo.user_id;
                    }
                }),
                catchError((err: any) => {
                    this.errorMessage = 'Jogo não encontrado ou erro de servidor.';
                    this.loading = false;
                    console.error(err);
                    return of(undefined); 
                })
            );
        })
    );
  }
  
  // RESTANTE DOS CRUDs
  excluirJogo(jogoId: string, capaUrl?: string): void {
      if (!confirm('Tem certeza de que deseja EXCLUIR este jogo e todas as suas revisões?')) {
          return;
      }

      this.jogosService.excluirJogo(jogoId, capaUrl).subscribe({
          next: () => {
              alert('Jogo excluído com sucesso!');
              this.refreshService.triggerRefresh(); 
              this.router.navigate(['/catalogo']); 
          },
          error: (err: any) => {
              this.errorMessage = `Falha ao excluir o jogo: ${err.message}. Verifique as políticas RLS de DELETE.`;
              console.error(err);
          }
      });
  }

  excluirRevisao(revisaoId: string): void {
    if (!confirm('Tem certeza de que deseja EXCLUIR esta revisão?')) {
        return;
    }

    this.revisoesService.excluirRevisao(revisaoId).subscribe({
        next: () => {
            alert('Revisão excluída com sucesso!');
            // refresh da página de detalhes do jogo
            this.refreshService.triggerRefresh(); 
        },
        error: (err: any) => {
            alert(`Falha ao excluir a revisão: ${err.message}. Verifique as políticas RLS de DELETE na tabela 'revisoes'.`);
            console.error(err);
        }
    });
  }

  editarRevisao(revisaoId: string, jogoId: string | undefined): void {
    if (!jogoId) return;
    this.router.navigate(['/jogo', jogoId, 'revisao-form', revisaoId]);
  }
}