import { Routes } from '@angular/router';

// componentes necessários para as rotas
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CatalogoComponent } from './views/catalogo/catalogo.component';
import { FormularioRevisaoComponent } from './forms/formulario-revisao/formulario-revisao.component';
import { AuthGuard } from './auth/auth.guard';
import { PreventAuthGuard } from './auth/prevent-auth.guard'; 
import { DetalheJogoComponent } from './views/detalhe-jogo/detalhe-jogo.component';
import { FormularioJogoComponent } from './forms/formulario-jogo/formulario-jogo.component';

export const routes: Routes = [


  // ----------------------------------------
  //  Rotas Públicas (Acesso Livre)
  // ----------------------------------------


  { path: '', redirectTo: 'catalogo', pathMatch: 'full' }, 
  { path: 'catalogo', component: CatalogoComponent, title: 'Catálogo de Jogos' },
  { path: 'jogo/:id', component: DetalheJogoComponent, title: 'Detalhe do Jogo' }, 
  
  // BLOQUEIO DE ACESSO PARA USUÁRIOS LOGADOS
  { 
    path: 'login', 
    component: LoginComponent, 
    title: 'Login',
    canActivate: [PreventAuthGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    title: 'Registro',
    canActivate: [PreventAuthGuard] 
  },
  

  // ----------------------------------------
  // Rotas Protegidas (precisam realizar login)
  // ----------------------------------------
  

  // Rotas de Jogo
  { 
    path: 'novo-jogo', 
    component: FormularioJogoComponent, 
    title: 'Registrar Jogo',
    canActivate: [AuthGuard] 
  },
  { 
    path: 'jogo/editar/:id', 
    component: FormularioJogoComponent, 
    title: 'Editar Jogo',
    canActivate: [AuthGuard] 
  },
  
  // Rotas de Revisão (Criação)
  { 
    path: 'jogo/:jogoId/revisao-form', 
    component: FormularioRevisaoComponent, 
    title: 'Nova Revisão',
    canActivate: [AuthGuard] 
  },

  // Rotas de Revisão (Edição)
  { 
    path: 'jogo/:jogoId/revisao-form/:revisaoId', 
    component: FormularioRevisaoComponent, 
    title: 'Editar Revisão',
    canActivate: [AuthGuard] 
  },
  
  // ----------------------------------------
  // 3. Rota Wildcard (404): serve para redirecionar rotas inválidas
  // ----------------------------------------
  { path: '**', redirectTo: 'catalogo' }
];