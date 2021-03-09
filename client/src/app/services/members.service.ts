import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LikesParams } from '../models/likesParams';
import { Member } from '../models/member';
import { PaginatedResult } from '../models/pagination';
import { User } from '../models/user';
import { UserParams } from '../models/userParams';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;
  likesParams: LikesParams;

  constructor(private http: HttpClient,private accountService: AccountService) {
    accountService.currentUser$.pipe(take(1)).subscribe( user => {
      this.user = user;
      this.userParams = new UserParams(user);
    });

    this.likesParams = new LikesParams('liked', 1, 5);
   }

   getUserParams(){
     return this.userParams;
   }

   setUserParams(paramss: UserParams){
     this.userParams = paramss;
   }

   getlikesParams(){
    return this.likesParams;
   }

   setLikesParams(lparamss: LikesParams){
    this.likesParams = lparamss;
   }

   resetUserParams(){
     this.userParams = new UserParams(this.user);
     return this.userParams;
   }

  getMembers(userParams: UserParams) {
    var response = this.memberCache.get(Object.values(userParams).join('-'));
    if(response) return of(response);

    let params = this.getPaginationHeaders(userParams.pageNumber, userParams.pageSize)

    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender.toString());
    params = params.append('orderBy', userParams.orderBy.toString());

    // if(this.members.length > 0) return of(this.members);
    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params).pipe(
      map( res => {
        this.memberCache.set(Object.values(userParams).join('-'),res);
        return res;
      })
    );
  }

  getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return params;
  }

  getMember(username: string) {
    // const member = this.members.find(x => x.username === username);
    // if (member !== undefined) return of(member);
    const member = [...this.memberCache.values()]
                  .reduce((arr, elem)=> arr.concat(elem.result), [])
                  .find((member: Member) => member.username === username);

    if(member) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId)
  }

  private getPaginatedResult<T>(url, params: HttpParams) {

    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();

    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') !== null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }

        return paginatedResult;
      })

    );
  }

  addLike(username: string){
    return this.http.post(this.baseUrl + 'likes/' +username, {});
  }

  getLikes(likesParams: LikesParams){
    let params = this.getPaginationHeaders(likesParams.pageNumber, likesParams.pageSize);
    params = params.append('predicate',likesParams.predicate);
    // return this.http.get<Partial<Member[]>>(this.baseUrl + 'likes?predicate='+predicate);
    return this.getPaginatedResult<Partial<Member[]>>(this.baseUrl+'likes',params);
  }
}
