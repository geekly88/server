export interface Users{

    id : number;
    parent_id : number,
    company_id : number,branch_id:number,

    username     : string,
    password     : string,
    rePassword   : string,
    email        : string,

    register_id  : number,
    // stayLoggedIn : boolean,
    role         : string,
    super        : boolean,
    active       : boolean,
    admin        : boolean;
    createdAt : Date,
    updatedAt : Date,

}