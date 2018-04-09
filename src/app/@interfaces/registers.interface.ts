export interface Registers {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,


    name : string,
    number : number,
    open:boolean,
    count : number,
    user : string,
    user_id : number,

    counted : number,
    expected : number,

    createdAt : Date,
    updatedAt : Date,
};