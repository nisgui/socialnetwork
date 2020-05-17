import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-cientista',
  templateUrl: './registro-cientista.component.html',
  styleUrls: ['./registro-cientista.component.css']
})
export class RegistroCientistaComponent implements OnInit {

  public title: string = "Registro de Pesquisador";
  public user: any = {};
  public status: string;
  public identity;
  public token;

  constructor(
    private router: Router,
    private apiService: ApiService, ) { }

  ngOnInit(): void {

  }
  onSubmit(form) {
    console.log(this.user)

    this.apiService.post("cientista", {
      "email": this.user.email,
      "password": this.user.password,
      "nome": this.user.nome,
      "nivelFormacao": this.user.nivelFormacao,
      "link": this.user.link,
      "cidade": this.user.cidade,
      "estado": this.user.estado,
      "dataNascimento": this.user.dataNascimento,
      "dataTrabalho": this.user.dataTrabalho,
    }).subscribe(data => {
      if (data.status === 200) {
        console.log(data);
       // this.router.navigate([`/feed-${data.body.tipo.toLowerCase()}`]);
      }
    });
  }
}

