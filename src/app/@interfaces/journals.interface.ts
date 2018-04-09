export interface Journals {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,


    title : string,
    page:number,
    creditor : number,
    debitor : number,
    status : string,
    data : Date,

    createdAt : Date,
    updatedAt : Date,

};

