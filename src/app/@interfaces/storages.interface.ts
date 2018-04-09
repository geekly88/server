export interface Storages {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,
    name : string,
    code : number,
    email : string,
    phone : string,
    mobile : string,
    fax:string,
    phoneType:string,

    country : string,
    state:string,
    city : string,
    address1 : string,
    address2 : string,
    postcode : string,
    location : JSON,
    img:string,

    createdAt : Date,
    updatedAt : Date,

};