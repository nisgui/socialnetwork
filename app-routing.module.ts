import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegistroCientistaComponent } from './components/registro-cientista/registro-cientista.component';
import { RegistroMembroComponent } from './components/registro-membro/registro-membro.component';
import { FeedComponent } from './components/feed/feed.component';
import { AtualizarComponent } from './components/atualizar/atualizar.component';
import { AtualizarmembroComponent } from './components/atualizarmembro/atualizarmembro.component';
import { FeedCientistaComponent } from './components/feed-cientista/feed-cientista.component';
import { NewComponent } from './components/new/new.component';



const routes: Routes = [ 
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'registro-membro', component: RegistroMembroComponent},
  {path: 'registro-cientista', component: RegistroCientistaComponent},
  {path: 'feed-membro', component: FeedComponent},
  {path: 'feed-cientista', component: FeedCientistaComponent},
  {path: 'atualizar', component: AtualizarComponent},
  {path: 'atualizarmembro', component: AtualizarmembroComponent},
  {path: 'new', component: NewComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
