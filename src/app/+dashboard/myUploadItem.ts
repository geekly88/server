import { UploadItem }    from 'angular2-http-file-upload';
 
export class MyUploadItem extends UploadItem {
    constructor(file: any) {
        super();
        this.url = 'http://localhost:1337/';
        this.headers = { };
        this.file = file;
    }
}