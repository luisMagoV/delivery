import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    },
    {
        path: 'no-login-product',
        loadChildren: () => import('./no-login-product/no-login-product.module').then(m => m.NoLoginProductPageModule),
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
    },
    {
        path: 'messaging',
        loadChildren: () => import('./messaging/messaging.module').then(m => m.MessagingPageModule),
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules}),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
