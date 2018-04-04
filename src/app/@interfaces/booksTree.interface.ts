export interface BooksTree {

    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,


    name : string,
    name_ar : string,
    code : string,
    sequence : number,
    depth : number,
    description : string,
    father : string,
    father_code : number,
    root : string,
    root_code : number,
    creditor : number,
    debitor : number,
    status : string,

    is_cred_deb:boolean,
    is_by_system:Boolean,

    children : Array<BooksTree>,
    focus : Boolean,

    createdAt : Date,
    updatedAt : Date,

};

