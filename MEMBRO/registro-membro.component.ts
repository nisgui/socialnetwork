import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-registro-membro',
  templateUrl: './registro-membro.component.html',
  styleUrls: ['./registro-membro.component.css']
})
export class RegistroMembroComponent implements OnInit {
  public title: string  = "Registro de Membro";
  public user: any = {};
  public status: string;
  public identity;
  public token;

  constructor(
    private router: Router,
    private apiService: ApiService,

  ) { }

  ngOnInit(): void {
  }
  onSubmit(form) {
    console.log(this.user)

    this.apiService.post("usuario", {
      "email": this.user.email,
      "password": this.user.password,
      "nome": this.user.nome,
      "identidade": this.user.identidade,
      "temasInteresse": this.user.temasInteresse,
      "temasInteresse2": this.user.temasInteresse2,
      "temasInteresse3": this.user.temasInteresse3,
      "temasInteresse4": this.user.temasInteresse4,
      "nivelEscolar": this.user.nivelEscolar,
    }).subscribe(data => {
      if (data.status === 200) {
        console.log(data);
        this.status= "success"
        //this.router.navigate([`/feed-${data.body.tipo.toLowerCase()}`]);
      }
    });
  }
}



