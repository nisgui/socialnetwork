import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit {

  data: any = {};

  constructor(
    private apiService: ApiService
  ) { }

ngOnInit() {

}

publicar() {
	console.log(this.data);

 this.apiService.post("posts", this.data).subscribe(data => {
      if (data.status === 200) {
        console.log(data);
      }
    },err => { 
	console.log(err);
    });
  }



postar() {



}

}
