import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  model:any = {}
  @Output() registerMode = new EventEmitter<boolean>();

  constructor(private accountService:AccountService, private toastr:ToastrService) { }

  ngOnInit(): void {
  }

  regiter(){
    this.accountService.register(this.model).subscribe(response =>{
      this.cancel();
    },err =>{
      console.error(err);
      this.toastr.error(err.error);
    });
  }

  cancel(){
    this.registerMode.emit(false);
  }
}
