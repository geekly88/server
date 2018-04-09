export interface BookKepping {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,


    name : string,
    code : string,
    description : string,
    father : string,
    father_code : number,
    root : string,
    root_code : number,
    model : string,
    model_id : number,
    agent_id : number,
    depth : number,
    creditor : Array<number>,
    debitor : Array<number>,
    status : string,

    from_account : Array<string>,
    from_code:Array<string>,
    to_account : Array<string>,
    to_code:Array<string>,
    balance : number,
    page: number,

    book_date : Date,
    book:string,
    book_code:number,
    is_by_system:Boolean,

    createdAt : Date,
    updatedAt : Date,

};

