import { Component, OnInit } from '@angular/core';
import { LikesParams } from '../models/likesParams';
import { Member } from '../models/member';
import { Pagination } from '../models/pagination';
import { MembersService } from '../services/members.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {

  members: Partial<Member[]>;
  likesParams: LikesParams;
  pagination: Pagination;

  constructor(private memberService: MembersService) {
    this.likesParams = memberService.getlikesParams();
   }

  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes(){
    this.memberService.setLikesParams(this.likesParams);
    this.memberService.getLikes(this.likesParams).subscribe((response)=>{
      this.members = response.result;
      this.pagination = response.pagination;
    });
  }

  pageChanged(event: any){
    this.likesParams.pageNumber = event.page;
    this.memberService.setLikesParams(this.likesParams);
    this.loadLikes();
  }
}
