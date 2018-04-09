export interface Banks {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,
    status : string,

    name: string,
    number : string,

    location : JSON,

    country : string,
    state:string,
    city : string,
    address1 : string,
    address2 : string,
    postcode : string,

    phone:string,
    mobile:string,
    fax:string,

    createdAt : Date,
    updatedAt : Date,
};