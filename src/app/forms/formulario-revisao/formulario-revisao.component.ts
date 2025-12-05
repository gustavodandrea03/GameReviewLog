import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { RevisoesService, Revisao } from '../../data/revisoes.service';
import { JogosService, Jogo } from '../../data/jogos.service';
import { CommonModule } from '@angular/common'; 
import { Observable, switchMap, tap, of } from 'rxjs'; 
import { RefreshService } from '../../core/refresh.service'; 

@Component({
  selector: 'app-formulario-revisao',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule], 
  templateUrl: './formulario-revisao.component.html',
  styleUrls: ['./formulario-revisao.component.css']
})
export class FormularioRevisaoComponent implements OnInit {
  
  revisaoForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  
  jogos$: Observable<Jogo[]> | undefined; 
  selectedFile: File | null = null; 

  // Variáveis de Status para Edição/Criação
  jogoId: string | null = null; // ID do jogo associado
  revisaoId: string | null = null; // ID da revisão (para edição)
  isEditing = false; 

  constructor(
    private fb: FormBuilder,
    private revisoesService: RevisoesService,
    private jogosService: JogosService,
    private router: Router,
    private route: ActivatedRoute, // Para ler os parâmetros da rota
    private refreshService: RefreshService // fazer refresh na página de detalhes
  ) {
    this.revisaoForm = this.fb.group({
      jogo_id: ['', [Validators.required]],
      pontuacao: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      pontos_fortes: ['', [Validators.required, Validators.minLength(10)]],
      pontos_fracos: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
  
  ngOnInit(): void {
    // Carrega a lista de jogos para o dropdown
    this.jogos$ = this.jogosService.getTodosJogos();
    
    // Lê os parâmetros da rota para determinar se é edição ou criação
    this.route.params.pipe(
      tap(params => {
        // Detecta o ID do Jogo 
        this.jogoId = params['jogoId'] || null;
        // Detecta o ID da Revisão (para edição)
        this.revisaoId = params['revisaoId'] || null;
        this.isEditing = !!this.revisaoId;
        
        // define o jogo_id no formulário se for criação
        if (!this.isEditing && this.jogoId) {
            this.revisaoForm.get('jogo_id')?.setValue(this.jogoId);
        }
      }),
      // Se estiver em Edição, busca os dados da revisão
      switchMap(() => {
          if (this.isEditing && this.revisaoId) {
              return this.revisoesService.getRevisao(this.revisaoId);
          }
          return of(null);
      }),
      tap(revisao => {
          if (revisao) {
              // prenche o formulário com os dados existentes
              this.revisaoForm.patchValue(revisao);
              // desabilita a seleção do jogo_id em edição
              this.revisaoForm.get('jogo_id')?.disable(); 
          }
      })
    ).subscribe({
        error: (err: any) => {
            this.errorMessage = `Falha ao carregar a revisão para edição: ${err.message}`;
        }
    });
  }

  onFileSelected(event: any): void { /* ... */ }

  // --- VALIDAÇÃO E SUBMISSÃO DO FORMULÁRIO ---
  onSubmit(): void {
    if (this.revisaoForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios e verifique a pontuação (1-10).';
      return;
    }
    
    this.loading = true;
    this.errorMessage = null;

    const dadosFormulario: Partial<Revisao> = this.revisaoForm.value;
    let operation$: Observable<any>;
    let successMessage: string;

    if (this.isEditing && this.revisaoId) {
        operation$ = this.revisoesService.updateRevisao(this.revisaoId, dadosFormulario);
        successMessage = 'Revisão atualizada com sucesso!';
    } else {
        const ficheiroParaUpload = this.selectedFile || new File([""], "placeholder.txt", { type: "text/plain" });
        operation$ = this.revisoesService.criarRevisao(dadosFormulario, ficheiroParaUpload);
        successMessage = 'Revisão submetida com sucesso!';
    }
    
    // realiza a operação (criação ou edição)
    operation$.subscribe({
      next: () => {
        alert(successMessage);
        this.refreshService.triggerRefresh(); // atualiza a página de detalhes do jogo
        this.router.navigate(['/jogo', this.jogoId || dadosFormulario.jogo_id]);
      },
      error: (err: any) => {
        this.errorMessage = `Falha na operação: ${err.message}`;
        console.error(err);
        this.loading = false;
      }
    });
  }
}