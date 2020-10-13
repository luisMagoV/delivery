import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PedidoStepsPage} from './pedido-steps.page';
import {CheckoutPage} from './checkout/checkout.page';
import {ProductsPage} from './products/products.page';
import {PromoStorePage} from './promo-store/promo-store.page';
import {CategoryPage} from './category/category.page';

const routes: Routes = [
    {
        path: '',
        component: PedidoStepsPage,
    },
    {
        path: 'category',
        component: CategoryPage,
    },
    {
        path: 'promo-store',
        component: PromoStorePage,
    },
    {
        path: 'products',
        component: ProductsPage,
    },
    {
        path: 'checkout',
        component: CheckoutPage,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PedidoStepsRoutingModule {
}
