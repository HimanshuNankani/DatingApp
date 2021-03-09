export class LikesParams{
    predicate: string;
    pageNumber: number;
    pageSize: number;

    constructor(_predicate: string, _pageNumber: number, _pageSize: number){
        this.predicate = _predicate;
        this.pageNumber = _pageNumber;
        this.pageSize = _pageSize;
    }
}