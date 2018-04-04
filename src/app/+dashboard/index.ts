import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponentsModule } from './../@components/module';
import * as child from './exports';
import { ChartModule } from 'angular2-chartjs';

// import { AuthGuard } from './../@providers';
// async components must be named routes for WebpackAsyncRoute
export const routes = [
    { path : '' , redirectTo : 'index', pathMatch : 'full' },
    { path : 'index' , component : child.IndexComponent },
    //============================================================================
    { path : 'suppliers' , component : child.SupplierComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+suppliers') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'customers' , component : child.CustomersComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+customers') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'employees' , component : child.EmployeesComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+employees') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'products' , component : child.ProductsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+products') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'history' , component : child.HistoryComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+history') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'timer' , component : child.TimerComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+timer') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'trash' , component : child.ProductsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+trash') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'buys' , component : child.BuysComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+buys') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'sells' , component : child.SellsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+sells') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'types' , component : child.TypesComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+types') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'collections' , component : child.CollectionsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+collections') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'brands' , component : child.BrandsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+brands') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'options' , component : child.OptionsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+options') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'taxes' , component : child.TaxesComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+taxes') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'settings' , component : child.SettingsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+settings') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'gifts' , component : child.GiftsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+gifts') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'accounts' , component : child.AccountsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+accounts') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'users' , component : child.UsersComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+users') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'expenses' , component : child.ExpensesComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+expenses') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'paids' , component : child.PaidsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+paids') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'registers' , component : child.RegistersComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+registers') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'registersHistory' , component : child.RegistersHistoryComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+registersHistory') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'reports' , component : child.ReportsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+reports') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'storages' , component : child.StoragesComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+storages') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'bookKepping' , component : child.BookKeppingComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+bookKepping') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'booksTree' , component : child.BooksTreeComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+booksTree') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'banks' , component : child.BanksComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+banks') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
    { path : 'journals' , component : child.JournalsComponent , children : 
        [{ path: '', loadChildren : ()=> System.import('./+journals') 
            .then((comp : any) => comp.default),
        }]
    },//============================================================================
];

@NgModule({
    declarations: [
        // Components / Directives/ Pipes
        child.JournalsComponent,
        child.TrashComponent,
        child.HistoryComponent,
        child.TimerComponent,
        child.IndexComponent,
        child.SupplierComponent,
        child.ProductsComponent,
        child.BuysComponent,
        child.SellsComponent,
        child.RegistersComponent,
        child.RegistersHistoryComponent,
        child.TypesComponent,
        child.CollectionsComponent,
        child.BrandsComponent,
        child.OptionsComponent,
        child.TaxesComponent,
        child.SettingsComponent,
        child.GiftsComponent,
        child.CustomersComponent,
        child.EmployeesComponent,
        child.ExpensesComponent,
        child.UsersComponent,
        child.AccountsComponent,
        child.StoragesComponent,
        child.ReportsComponent,
        child.PaidsComponent,
        child.BookKeppingComponent,
        child.BooksTreeComponent,
        child.BanksComponent,
    ],
    imports: [
        DashboardComponentsModule,
        CommonModule,
        RouterModule.forChild(routes),
        ChartModule
    ]
})
export default class DashboardModule {
    static routes = routes;
}
