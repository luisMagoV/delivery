import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {PrizesPage} from './prizes';

import {PrizesRoutingModule} from './prizes-routing.module';
import {HistoryPage} from './history/history';
import {LegalPage} from './legal/legal';
import {CongratsPage} from './congrats/congrats';
import {PipeModule} from '../../pipes/pipe.module';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/prizes/', '.json');
}

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild([{path: '', component: PrizesPage}]),
        PrizesRoutingModule,
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
        PrizesPage,
        HistoryPage,
        LegalPage,
        CongratsPage,
    ],
    entryComponents: [
        HistoryPage,
        LegalPage,
        CongratsPage,
    ],
})
export class PrizesModule {
}
