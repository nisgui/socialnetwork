import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegistroCientistaComponent } from './components/registro-cientista/registro-cientista.component';
import { RegistroMembroComponent } from './components/registro-membro/registro-membro.component';
import { FormsModule } from '@angular/forms';
import { FeedComponent } from './components/feed/feed.component';
import { AtualizarComponent } from './components/atualizar/atualizar.component';
import { AtualizarmembroComponent } from './components/atualizarmembro/atualizarmembro.component';
import { HttpClientModule } from '@angular/common/http';
import { FeedCientistaComponent } from './components/feed-cientista/feed-cientista.component';
import { NewComponent } from './components/new/new.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    RegistroCientistaComponent,
    RegistroMembroComponent,
    FeedComponent,
    AtualizarComponent,
    AtualizarmembroComponent,
    FeedCientistaComponent,
    NewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
