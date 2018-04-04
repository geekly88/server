export interface Types{
    id : number,
    parent_id : number,
    company_id : number,
    author_id : number,

    name: string,
    father : string,
    father_id : number,
    main_id:number,
    child_quantity:number,
    ids_chain:Array<number>;

    index : any, // number || string

    createdAt : Date,
    updatedAt : Date,
};