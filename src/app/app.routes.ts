import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { NoContentComponent } from './Errors';
import { IndexComponent } from './+index/index.component';
import { DashboardComponent } from './+dashboard/dashboard.component';
import { AuthGuard } from './@providers';


export const ROUTES: Routes = [
    { path: '',      redirectTo : 'login', pathMatch : 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'register/init', component: RegisterComponent },
    // {
    //   path: 'dashboard', loadChildren: () => System.import('./+dashboard')
    //     .then((comp: any) => comp.default),
    // },
    {path : 'index' , component : IndexComponent ,
     children : [
        {path : '' , loadChildren : ()=> System.import('./+index').
        then((comp:any) => comp.default)}
    ]},
    {path : 'dashboard' , component : DashboardComponent ,canActivate: [AuthGuard],
     children : [
        {path : '' , loadChildren : ()=> System.import('./+dashboard').
        then((comp:any) => comp.default)}
    ]},
    { path: '**', redirectTo : 'login' },
    // { path: '**',    component: NoContentComponent },
];

