import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';

@Component({
    selector: 'page-congrats',
    templateUrl: 'congrats.html',
    styleUrls: ['congrats.scss'],
})
export class CongratsPage {

    constructor(
        public appConfig: GlobalConfigProvider,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        private translateService: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    navigate(uri: string) {
        this.router.navigate(['/tabs/' + uri]);
    }
}
