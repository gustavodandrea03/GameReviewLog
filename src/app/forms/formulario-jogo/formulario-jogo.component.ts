import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { JogosService, Jogo } from '../../data/jogos.service';
import { CommonModule } from '@angular/common'; 
import { switchMap, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { RefreshService } from '../../core/refresh.service'; 

@Component({
  selector: 'app-formulario-jogo',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule], 
  templateUrl: './formulario-jogo.component.html',
  styleUrls: ['./formulario-jogo.component.css']
})
export class FormularioJogoComponent implements OnInit {
  
  jogoForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  
  // Variáveis de Status para Edição/Criação
  jogoId: string | null = null; 
  isEditing = false; 
  currentCapaUrl: string | null = null; 
  
  selectedFile: File | null = null; 

  constructor(
    private fb: FormBuilder,
    private jogosService: JogosService,
    private router: Router,
    private route: ActivatedRoute,
    private refreshService: RefreshService 
  ) {
    // Inicialização do Formulário Reativo (base para Criação e Edição)
    this.jogoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      plataforma: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      data_lancamento: [''] 
    });
  }

  ngOnInit(): void {
    // verifica se há um ID na rota para determinar se é edição ou criação
    this.route.params.pipe(
      switchMap(params => {
        const id = params['id'];
        if (id) {
          this.jogoId = id;
          this.isEditing = true;
          return this.jogosService.getJogo(id); 
        }
        return of(null); 
      }),
      tap(jogo => {
        if (jogo) {
          // se for edição, o formulário é populado com os dados existentes
          this.jogoForm.patchValue({
            titulo: jogo.titulo,
            plataforma: jogo.plataforma,
            genero: jogo.genero,
            data_lancamento: jogo.data_lancamento ? jogo.data_lancamento.split('T')[0] : '' 
          });
          this.currentCapaUrl = jogo.capa_url || null;
        }
      })
    ).subscribe({
        error: (err: any) => {
            this.errorMessage = `Erro ao carregar dados do jogo: ${err.message}`;
        }
    });
  }

  // Manipulação de Seleção de arquivo de Capa
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
      if (file) {
        alert('Por favor, selecione um ficheiro de imagem válido.');
      }
    }
  }

  // --- Envio do Formulário para Criação ou Edição ---
  onSubmit(): void {
    if (this.jogoForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios do jogo.';
      return;
    }

    // Validação de capa para criação
    if (!this.isEditing && !this.selectedFile) {
      this.errorMessage = 'É obrigatório fazer o upload da imagem de capa.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const dadosFormulario: Partial<Jogo> = this.jogoForm.value;
    let operation$: Observable<any>;
    let successMessage: string;
    let redirectUrl: string[];

    if (this.isEditing && this.jogoId) {
      // chama o método de atualização (CRUD: UPDATE)
      operation$ = this.jogosService.updateJogo(this.jogoId, dadosFormulario);
      successMessage = 'Jogo atualizado com sucesso!';
      redirectUrl = ['/jogo', this.jogoId];
    } else {
      // chama o método de criação (CRUD: CREATE)
      operation$ = this.jogosService.criarJogo(dadosFormulario, this.selectedFile!);
      successMessage = 'Jogo registrado e capa enviada com sucesso!';
      redirectUrl = ['/catalogo'];
    }

    // subscribe unificado para ambas as operações
    operation$.subscribe({
      next: () => {
        alert(successMessage);
        
        if (this.isEditing) {
            this.refreshService.triggerRefresh(); 
            this.router.navigate(['/jogo', this.jogoId]);
        }
        
        this.router.navigate(redirectUrl);
      },
      error: (err: any) => {
        this.errorMessage = `Falha na operação: ${err.message}`;
        console.error(err);
        this.loading = false;
      }
    });
  }
}