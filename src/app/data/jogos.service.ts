
import { Injectable } from '@angular/core';
import { SupabaseService } from '../core/supabase.service';
import { from, Observable, of } from 'rxjs'; 
import { map, switchMap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';

export interface Jogo {
  id?: string;
  user_id: string;
  titulo: string;
  plataforma: string;
  genero: string;
  data_lancamento: string;
  capa_url?: string;
  pontuacao_media?: number;
}

@Injectable({
  providedIn: 'root'
})
export class JogosService {
  private readonly TABLE_JOGOS = 'jogos';
  private readonly BUCKET_CAPAS = 'capas';

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  // --- (CRUD: READ) ---

  getTodosJogos(): Observable<Jogo[]> {
    return from(
      this.supabaseService.supabase.from(this.TABLE_JOGOS)
        .select('*')
        .order('titulo', { ascending: true }) 
    ).pipe(
      map(response => {
        if (response.error) throw response.error; 
        return response.data as Jogo[];
      })
    );
  }

  getJogo(id: string): Observable<Jogo> {
    return from(
      this.supabaseService.supabase.from(this.TABLE_JOGOS)
        .select('*')     
        .eq('id', id)
        .single() 
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data as Jogo;
      })
    );
  }

  // --- (CRUD: CREATE) e Storage ---

  criarJogo(novoJogo: Partial<Jogo>, ficheiroCapa: File): Observable<void> {
    const userId = this.authService.currentUserId; 
    if (!userId) {
      return new Observable(observer => observer.error(new Error('Usuário não autenticado.')));
    }

    return this.uploadCapa(ficheiroCapa).pipe(
      switchMap(capaUrl => {
        const jogoComUrl: Jogo = {
          ...novoJogo as Jogo,
          user_id: userId,
          capa_url: capaUrl
        };
        
        return from(
          this.supabaseService.supabase.from(this.TABLE_JOGOS).insert([jogoComUrl])
        );
      }),
      map(response => {
        if (response.error) throw response.error;
        return; 
      })
    );
  }

  private uploadCapa(ficheiroCapa: File): Observable<string> {
    const userId = this.authService.currentUserId || 'anon';
    const filePath = `${userId}/${uuidv4()}-${ficheiroCapa.name}`;
    
    return from(
      this.supabaseService.supabase.storage
        .from(this.BUCKET_CAPAS)
        .upload(filePath, ficheiroCapa)
    ).pipe(
      switchMap((uploadResponse: any) => { 
        if (uploadResponse.error) {
          throw uploadResponse.error;
        }
        
        const { data } = this.supabaseService.supabase.storage
          .from(this.BUCKET_CAPAS)
          .getPublicUrl(filePath);
          
        if (!data.publicUrl) {
           throw new Error('Erro ao obter URL pública.');
        }

        return [data.publicUrl]; 
      })
    );
  }

// UPDATE - CRUD

updateJogo(id: string, jogo: Partial<Jogo>): Observable<void> { 
  return from(
    this.supabaseService.supabase.from(this.TABLE_JOGOS)
      .update(jogo)
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


  // --- (CRUD: DELETE) ---

  excluirJogo(jogoId: string, capaUrl?: string): Observable<void> {
    
    // se existir capaUrl, excluir do Storage primeiro
    const deleteStorage$ = capaUrl ? this.deleteFileFromStorage(capaUrl) : of(undefined) as Observable<void>;

    return deleteStorage$.pipe(
      switchMap(() => {
        return from(
          this.supabaseService.supabase.from(this.TABLE_JOGOS)
            .delete()
            .eq('id', jogoId)
        );
      }),
      map((response: any) => { 
        if (response.error) throw response.error;
        return;
      })
    );
  }

  /**
   * Função para excluir da Storage do Supabase
   */
  private deleteFileFromStorage(fileUrl: string): Observable<void> {
      try {
          const urlParts = fileUrl.split(`${this.BUCKET_CAPAS}/`);
          
          if (urlParts.length < 2) return of(undefined) as Observable<void>; 

          const filePath = urlParts[1];

          return from(
              this.supabaseService.supabase.storage
                  .from(this.BUCKET_CAPAS)
                  .remove([filePath])
          ).pipe(
              map((response: any) => { 
                  if (response.error) {
                      if (response.error.message.includes('The resource was not found')) {
                          return;
                      }
                      throw response.error;
                  }
                  return;
              })
          );
      } catch (e) {
          console.error("Erro ao preparar exclusão do Storage:", e);
          
          return of(undefined) as Observable<void>; 
      }
  }
}