import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';
import { from, Observable, of } from 'rxjs'; 
import { map, switchMap, catchError } from 'rxjs/operators'; 
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';

export interface Revisao {
  id?: string;
  user_id: string; 
  jogo_id: string;
  data_revisao: string; 
  pontuacao: number; 
  pontos_fortes: string;
  pontos_fracos: string;
  screenshot_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RevisoesService {
  private readonly TABLE_REVISOES = 'revisoes';
  private readonly BUCKET_SCREENSHOTS = 'screenshots'; 

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  // --- Operações (CRUD: READ) ---

  getRevisoesPorJogo(jogoId: string): Observable<Revisao[]> {
    return from(
      this.supabaseService.supabase.from(this.TABLE_REVISOES)
        .select('*')
        .eq('jogo_id', jogoId) 
        .order('data_revisao', { ascending: false }) 
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as Revisao[];
      })
    );
  }

  // função para obter uma revisão específica (para edição)
  getRevisao(revisaoId: string): Observable<Revisao | null> {
    return from(
      this.supabaseService.supabase.from(this.TABLE_REVISOES)
        .select('*')
        .eq('id', revisaoId)
        .single()
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as Revisao;
      }),
      catchError(err => {
        console.error("Erro ao buscar revisão para edição:", err);
        return of(null);
      })
    );
  }

  // --- Operações (CRUD: CREATE) ---

  criarRevisao(novaRevisao: Partial<Revisao>, ficheiroScreenshot: File): Observable<void> {
    const userId = this.authService.currentUserId;
    if (!userId) {
      return new Observable(observer => observer.error(new Error('Usuário não autenticado.')));
    }

    // faz o upload do screenshot e depois insere o registro da revisão
    return this.uploadScreenshot(ficheiroScreenshot).pipe(
      switchMap(screenshotUrl => {
        const revisaoComUrl: Revisao = {
          ...novaRevisao as Revisao,
          user_id: userId,
          data_revisao: new Date().toISOString(), 
          screenshot_url: screenshotUrl
        };
        
        return from(
          this.supabaseService.supabase.from(this.TABLE_REVISOES).insert([revisaoComUrl])
        );
      }),
      map(response => {
        if (response.error) throw response.error;
        return; 
      })
    );
  }

  // Atualização (CRUD: UPDATE)
 
  updateRevisao(id: string, revisao: Partial<Revisao>): Observable<void> {
    return from(
      this.supabaseService.supabase.from(this.TABLE_REVISOES)
        .update(revisao)
        .eq('id', id)
    ).pipe(
      map(response => {
        if (response.error) {
          throw response.error;
        }
        return; 
      })
    );
  }

  // Exclusão (CRUD: DELETE)
 
  excluirRevisao(id: string): Observable<void> {
    // Exclui a revisão pelo ID
    
    return from(
      this.supabaseService.supabase.from(this.TABLE_REVISOES)
        .delete()
        .eq('id', id)
    ).pipe(
      map(response => {
        if (response.error) {
          throw response.error;
        }
        return; 
      })
    );
  }

  // Função auxiliar para upload de screenshots

  private uploadScreenshot(ficheiroScreenshot: File): Observable<string> {
    const userId = this.authService.currentUserId || 'anon';
    const filePath = `${userId}/${uuidv4()}-${ficheiroScreenshot.name}`;
    
    return from(
      this.supabaseService.supabase.storage
        .from(this.BUCKET_SCREENSHOTS)
        .upload(filePath, ficheiroScreenshot, {
          cacheControl: '3600',
          upsert: false 
        })
    ).pipe(
      switchMap((uploadResponse: any) => {
        if (uploadResponse.error) {
          throw uploadResponse.error;
        }
        
        const { data } = this.supabaseService.supabase.storage
          .from(this.BUCKET_SCREENSHOTS)
          .getPublicUrl(filePath);
          
        if (!data.publicUrl) {
           throw new Error('Erro ao obter URL pública após upload.');
        }

        return [data.publicUrl]; 
      })
    );
  }
}