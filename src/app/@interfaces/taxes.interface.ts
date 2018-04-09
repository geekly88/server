export interface Taxes {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,

    name : string,
    tax : number,

    createdAt : Date,
    updatedAt : Date,
};