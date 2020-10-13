import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {ProfileRoutingModule} from './profile-routing.module';
import {ProfilePage} from './profile.page';
import {ContactPage} from './contact/contact';
import {HelpPage} from './help/help';
import {FaqPage} from './faq/faq';
import {FavoritesPage} from './favorites/favorites';
import {ProfileEditPage} from './edit/profile-edit';
import {PipeModule} from '../../pipes/pipe.module';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/profile/', '.json');
}

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        RouterModule.forChild([{path: '', component: ProfilePage}]),
        ProfileRoutingModule,
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
        ProfilePage,
        ContactPage,
        HelpPage,
        FaqPage,
        ProfileEditPage,
        FavoritesPage,
    ],
    entryComponents: [
        ContactPage,
        HelpPage,
        FaqPage,
        ProfileEditPage,
        FavoritesPage,
    ],
})
export class ProfileModule {
}
