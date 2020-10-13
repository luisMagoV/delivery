import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {HttpClientModule, HttpClient} from '@angular/common/http';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {IonicStorageModule, Storage} from '@ionic/storage';
import {Facebook} from '@ionic-native/facebook/ngx';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {NativeStorage} from '@ionic-native/native-storage/ngx';
import {Contacts} from '@ionic-native/contacts/ngx';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ConfigGlobalProvider} from '../providers/config.global.provider';
import {RestProvider} from '../providers/rest.provider';
import {GlobalConfigProvider} from '../providers/global-config';
import RestService from '../providers/rest-service';
import {PipeModule} from '../pipes/pipe.module';
import {LoginProvider} from '../providers/login.provider';
import {HttpModule} from '@angular/http';
import {AddressPage} from './addresses/address';
import {AutoCompletePage} from './auto-complete/auto-complete';
import {FormsModule} from '@angular/forms';
import {ServicesPage} from './services/services';
import {ProductDetailPage} from './product-detail/product-detail';
import {StatusOrderPage} from './status-order/status-order';
import {DetailOrderPage} from './detail-order/detail-order';
import {FormCardPage} from './form-card/form-card';
import {ComissionPage} from './comission/comission';
import {ClaimPage} from './claim/claim';
import {ServiceTypePage} from './service-type/service-type';
import {ChatPage} from './chat/chat';
import {PreordenPage} from './preorden/preorden';
import {SupermarketPage} from './supermarket/supermarket';
import {SelectPayPage} from './select-pay/select-pay';
import {PayDebtPage} from './pay-debit/pay-debt';
import {FinalOrderPage} from './final-order/final-order';
import {CreatePasswordPage} from './create-password/create-password';
import {ValidCodePage} from './validcode/validcode';
import {NgxMaskIonicModule} from 'ngx-mask-ionic';
import {ProductOpinionPage} from './product-opinion/product-opinion';
import {PointsPage} from './points/points';
import {PayMethodPage} from './pay-method/pay-method';
import {PayMethodsPage} from './pay-methods/pay-methods';
import {CouponsPage} from './coupons/coupons';
import {LoginButtonsPage} from './tabs/login-buttons/login-buttons.page';
import {LoginPage} from './tabs/login/login.page';
import {LoginWhatsappPage} from './tabs/login-whatsapp/login-whatsapp.page';
import {RegisterPage} from './tabs/register/register.page';
import {RecoveryPage} from './tabs/recovery/recovery.page';
import {PushService} from '../providers/push.service';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';



export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        AddressPage,
        AutoCompletePage,
        ServicesPage,
        ProductDetailPage,
        StatusOrderPage,
        DetailOrderPage,
        FormCardPage,
        ComissionPage,
        ClaimPage,
        ServiceTypePage,
        ChatPage,
        PreordenPage,
        SupermarketPage,
        SelectPayPage,
        PayDebtPage,
        FinalOrderPage,
        CreatePasswordPage,
        ValidCodePage,
        ProductOpinionPage,
        PointsPage,
        PayMethodPage,
        PayMethodsPage,
        CouponsPage,
        LoginButtonsPage,
        LoginPage,
        LoginWhatsappPage,
        RegisterPage,
        RecoveryPage,
    ],
    entryComponents: [
        AddressPage,
        AutoCompletePage,
        ServicesPage,
        ProductDetailPage,
        StatusOrderPage,
        DetailOrderPage,
        FormCardPage,
        ComissionPage,
        ClaimPage,
        ServiceTypePage,
        ChatPage,
        PreordenPage,
        SupermarketPage,
        SelectPayPage,
        PayDebtPage,
        FinalOrderPage,
        CreatePasswordPage,
        ValidCodePage,
        ProductOpinionPage,
        PointsPage,
        PayMethodPage,
        PayMethodsPage,
        CouponsPage,
        LoginButtonsPage,
        LoginPage,
        LoginWhatsappPage,
        RegisterPage,
        RecoveryPage,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot({
            mode: 'md',
            backButtonIcon: 'arrow-back',
        }),
        IonicStorageModule.forRoot(),
        HttpModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        PipeModule.forRoot(),
        NgxMaskIonicModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient],
            },
            // isolate: true,
        }),
    ],
    providers: [
        Geolocation,
        NativeStorage,
        Contacts,
        Facebook,
        GooglePlus,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: Storage, useFactory: provideStorage},
        GlobalConfigProvider,
        RestService,
        ConfigGlobalProvider,
        RestProvider,
        LoginProvider,
        PushService,
        SocialSharing,
    ],
    exports: [],
    bootstrap: [AppComponent],
})
export class AppModule {
}

function provideStorage() {
    return new Storage({name: 'kangarudb', driverOrder: ['sqlite', 'websql', 'indexeddb']});
}
