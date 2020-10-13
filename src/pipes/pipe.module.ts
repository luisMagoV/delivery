import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {Money} from './money';
import {SelectAddressPage} from '../app/pedido-steps/select-address/select-address.page';
import {Convert24To12} from './convert24To12';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/pipe/', '.json');
}

const MODULES = [];
const COMPONENTS = [];
const EXPORT = [
    SelectAddressPage,
    Money,
    Convert24To12,
];
const ENTRY = [
    SelectAddressPage,
];

@NgModule({
    imports: [CommonModule, ...MODULES, IonicModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
            isolate: true,
        }),
    ],
    exports: [CommonModule, ...EXPORT, ...COMPONENTS],
    declarations: [...COMPONENTS, ...EXPORT],
    entryComponents: [...ENTRY],
})
export class PipeModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: PipeModule,
            providers: [],
        };
    }
}
