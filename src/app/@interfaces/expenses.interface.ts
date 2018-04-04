export interface Expenses {

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    title : string,
    paid_date : Date,
    category:string,
    reference:string,
    amount:number,
    number:number,
    tax:number,
    payment_arr:Array<Object>,
    payment_way:string,

    book_title:string,
    book_code:string,
    book_id:number,

    is_registered:boolean,

    createdAt : Date,
    updatedAt : Date,
}