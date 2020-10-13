import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import RestService, {RestApi} from '../../../providers/rest-service';
import {GlobalConfigProvider} from '../../../providers/global-config';

@Component({
    selector: 'page-contact',
    styleUrls: ['contact.scss'],
    templateUrl: 'contact.html',
})
export class ContactPage {
    data: any;
    message: string;
    segment = 'faq';

    constructor(
        private rest: RestService,
        private translateService: TranslateService,
        public appConfig: GlobalConfigProvider,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
        this.appConfig.showLoading();
        this.rest.route(RestApi.FAQ).withAuth().get().then(res => {
            this.data = res.json().map(v => {
                v.toggle = false;
                return v;
            });
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });
    }

    send(): void {
        this.appConfig.showLoading();
        this.rest.route(RestApi.SUPPORT).withAuth().post({body: {message: this.message.trim()}}).then(res => {
            this.message = '';
            this.appConfig.hideLoading();
            this.appConfig.showAlert('Ayuda / Soporte', 'Mensaje enviado con éxito');
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });
    }

}
