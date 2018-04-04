import { Component } from '@angular/core';
import { RouterTransition } from './../../@providers';

@Component({
    selector : 'booksTree',
    templateUrl : './booksTree.html',
    animations : [RouterTransition()]
})
export class BooksTreeComponent{}