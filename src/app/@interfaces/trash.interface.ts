export interface Trash {

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,
    product_name : string,
    product_id : number,
    quantity:number,
    reason:string,
    unit:string,

    createdAt : Date,
    updatedAt : Date,

};