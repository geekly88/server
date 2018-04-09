import { Products } from './';
export interface Settings {

    id : number,
    parent_id : number,
    company_id : number,branch_id:number,
    author_id : number,

    is_registered : boolean,
    sale_terms:string,

    createdAt : Date,
    updatedAt : Date,

};