export interface Gifts {

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    name : string,
    code : string,
    type : string,
    is_percentage : boolean,
    amount : number,

    limit : number,
    counter:number,
    expire_date : Date,
    is_active:Boolean,

    status : string,

    createdAt : Date,
    updatedAt : Date,
    
}