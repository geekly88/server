export interface Timer {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,
    task : string,
    time:number,
    is_done:boolean,
    note:string,

    createdAt : Date,
    updatedAt : Date,

};