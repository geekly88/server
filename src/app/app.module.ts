import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, PreloadAllModules, UrlSerializer } from '@angular/router';
//====================================================================================
import { IndexComponent } from './+index/index.component';
import { DashboardComponent } from './+dashboard/dashboard.component';
import { DashboardHeaderComponent, DashboardSidebarComponent , IndexHeaderComponent, IndexFooterComponent} 
        from './$partials';
import { DashboardComponentsModule } from './@components/module';
import { TooltipModule } from "ngx-tooltip";


/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { AppComponent } from './app.component';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { NoContentComponent } from './Errors';
import { AuthGuard , GlobalProvider, LabProvider, CustomUrlSerializer } from './@providers';
import { AuthService , HttpRequestService } from './@services';
/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
    bootstrap: [ AppComponent ],
    declarations: [
        AppComponent,
        LoginComponent,
        RegisterComponent,
        IndexComponent,
        IndexHeaderComponent,
        IndexFooterComponent,
        DashboardComponent,
        DashboardSidebarComponent,
        DashboardHeaderComponent,
        NoContentComponent
    ],
    imports: [ // import Angular's modules
        BrowserModule,
        FormsModule,
        HttpModule,
        ReactiveFormsModule,
        TooltipModule,
        DashboardComponentsModule,
        RouterModule.forRoot(ROUTES, { useHash: true, preloadingStrategy: PreloadAllModules })
    ],
    providers: [ // expose our Services and Providers into Angular's dependency injection
        ENV_PROVIDERS,
        AuthGuard,
        LabProvider,
        GlobalProvider,
        HttpRequestService,
        { provide: UrlSerializer, useClass: CustomUrlSerializer }
    ]
})
export class AppModule {
    constructor(public appRef: ApplicationRef) {}
}

