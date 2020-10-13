import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormGroupDirective} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import {LoginProvider} from '../../../providers/login.provider';
import {NoLoginProductPage} from '../../no-login-product/no-login-product.page';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-login-buttons',
    templateUrl: 'login-buttons.page.html',
    styleUrls: ['login-buttons.page.scss'],
})
export class LoginButtonsPage {

    constructor(
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private oLoginProvider: LoginProvider,
        private modalController: ModalController,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    async back(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

    googleLogin() {
        this.oLoginProvider.googleLogin();
    }

    facebookLogin() {
        this.oLoginProvider.facebookLogin();
    }

    appleLogin() {
        this.oLoginProvider.appleLogin();
    }

    loginNo() {
        this.modalController.create({
            component: NoLoginProductPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                // console.log(data);
            });
        });
    }

    loginTest() {
        this.oLoginProvider.loginCustom(environment.loginTest);
    }

}
