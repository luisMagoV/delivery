import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TabsPage} from './tabs.page';
import {FormCardPage} from '../form-card/form-card';
import {ComissionPage} from '../comission/comission';
import {CouponsPage} from '../coupons/coupons';
import {ClaimPage} from '../claim/claim';
import {ServiceTypePage} from '../service-type/service-type';
import {ChatPage} from '../chat/chat';
import {DetailOrderPage} from '../detail-order/detail-order';
import {PreordenPage} from '../preorden/preorden';
import {SupermarketPage} from '../supermarket/supermarket';
import {SelectPayPage} from '../select-pay/select-pay';
import {PayDebtPage} from '../pay-debit/pay-debt';
import {PayMethodPage} from '../pay-method/pay-method';
import {StatusOrderPage} from '../status-order/status-order';
import {FinalOrderPage} from '../final-order/final-order';
import {CreatePasswordPage} from '../create-password/create-password';
import {ValidCodePage} from '../validcode/validcode';

const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'pedido-steps',
                loadChildren: () => import('../pedido-steps/pedido-steps.module').then(m => m.PedidoStepsModule),
            },
            {
                path: 'homemap',
                loadChildren: () => import('../homemap/homemap.module').then(m => m.HomemapModule),
            },
            {
                path: 'prizes',
                loadChildren: () => import('../prizes/prizes.module').then(m => m.PrizesModule),
            },
            {
                path: 'profile',
                loadChildren: () => import('../profile/profile.module').then(m => m.ProfileModule),
            },
            {
                path: 'promo',
                loadChildren: () => import('../promo/promo.module').then(m => m.PromoModule),
            },
            {
                path: 'pedido',
                loadChildren: () => import('../pedido/pedido.module').then(m => m.PedidoModule),
            },
            {
                path: 'settings',
                loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule),
            },
            {
                path: 'cards',
                component: FormCardPage,
            },
            {
                path: 'comission',
                component: ComissionPage,
            },
            {
                path: 'coupons',
                component: CouponsPage,
            },
            {
                path: 'claim',
                component: ClaimPage,
            },
            {
                path: 'chat',
                component: ChatPage,
            },
            {
                path: 'detail',
                component: DetailOrderPage,
            },
            {
                path: 'service',
                component: ServiceTypePage,
            },
            {
                path: 'preorden',
                component: PreordenPage,
            },
            {
                path: 'supermarket',
                component: SupermarketPage,
            },
            {
                path: 'select-pay',
                component: SelectPayPage,
            },
            {
                path: 'pay-debit',
                component: PayDebtPage,
            },
            {
                path: 'pay-method',
                component: PayMethodPage,
            },
            {
                path: 'status-order',
                component: StatusOrderPage,
            },
            {
                path: 'final-order',
                component: FinalOrderPage,
            },
            {
                path: 'create-password',
                component: CreatePasswordPage,
            },
            {
                path: 'validate',
                component: ValidCodePage,
            },
            {
                path: '',
                redirectTo: '/tabs/pedido-steps',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '',
        redirectTo: '/tabs/pedido-steps',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TabsPageRoutingModule {
}
