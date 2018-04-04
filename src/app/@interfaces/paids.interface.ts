export interface Paids {

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    title : string,
    paid_date : Date,
    amount : number,
    to:string,
    category:string,
    reference:string,
    number:number,
    tax:number,
    payment_by:string,
    payments : Array<any>,

    is_registered:boolean,
    is_recive:boolean,
    is_paid:boolean,
    from : string, // inv , cus , supp
    name:string, 
    name_id:string,

    createdAt : Date,
    updatedAt : Date,
}