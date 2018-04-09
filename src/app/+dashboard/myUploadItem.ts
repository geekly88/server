import { UploadItem }    from 'angular2-http-file-upload';

export class MyUploadItem extends UploadItem {
    constructor(file: any) {
        super();
        this.url = window.location.protocol + '//' + window.location.host + ':1337/';
        this.headers = { };
        this.file = file;
    }
}
