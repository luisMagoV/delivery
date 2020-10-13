import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {PedidoStepsPage} from './pedido-steps.page';

import {PedidoStepsRoutingModule} from './pedido-steps-routing.module';
import {PipeModule} from '../../pipes/pipe.module';
import {CheckoutPage} from './checkout/checkout.page';
import {ProductsPage} from './products/products.page';
import {PromoStorePage} from './promo-store/promo-store.page';
import {CategoryPage} from './category/category.page';
import {ContentLoaderPage} from '../content.loader.page';
import {ContentLoader200Page} from '../content.loader.200.page';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/pedido-steps/', '.json');
}

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        PedidoStepsRoutingModule,
        PipeModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
            isolate: true,
        }),
    ],
    declarations: [
        PedidoStepsPage,
        CheckoutPage,
        ProductsPage,
        ContentLoaderPage,
        ContentLoader200Page,
        PromoStorePage,
        CategoryPage,
    ],
    entryComponents: [
        CheckoutPage,
        ProductsPage,
        ContentLoaderPage,
        ContentLoader200Page,
        PromoStorePage,
        CategoryPage,
    ],
})
export class PedidoStepsModule {
}
