import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';

@Component({
    selector: 'page-legal',
    templateUrl: 'legal.html',
    styleUrls: ['legal.scss'],
})
export class LegalPage {

    constructor(
        private translateService: TranslateService,
        public appConfig: GlobalConfigProvider,
        public oConfigGlobalProvider: ConfigGlobalProvider,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    back () {
        this.appConfig.back();
    }
}
