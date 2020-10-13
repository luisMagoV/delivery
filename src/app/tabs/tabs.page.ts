import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {ModalController, Platform} from '@ionic/angular';
import {GlobalConfigProvider} from '../../providers/global-config';
import {LoginProvider} from '../../providers/login.provider';
import {LoginButtonsPage} from './login-buttons/login-buttons.page';
import {LoginPage} from './login/login.page';

@Component({
    selector: 'app-tabs',
    styleUrls: ['tabs.page.scss'],
    templateUrl: 'tabs.html',
})
export class TabsPage implements OnInit, OnDestroy, AfterViewInit {

    private backButtonSubscription;
    percent = 0;
    full = this.percent === 1 || this.percent === 3;

    constructor(
        private platform: Platform,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private oLoginProvider: LoginProvider,
        private modalController: ModalController,
        private router: Router,
    ) {
        this.percent += this.appConfig.environment.login.apple ? 1 : 0;
        this.percent += this.appConfig.environment.login.google ? 1 : 0;
        this.percent += this.appConfig.environment.login.facebook ? 1 : 0;
        this.full = this.percent === 1 || (this.appConfig.environment.login.apple && this.appConfig?.device?.operatingSystem === 'ios');
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngOnInit() {
        this.loadAuth();
    }

    ngAfterViewInit() {
        this.backButtonSubscription = this.platform.backButton.subscribe(() => {
            if (this.router.url === '/tabs/pedido-steps') {
                navigator['app'].exitApp();
            } else if (this.router.url.startsWith('/tabs/status-order')) {
                this.appConfig.changeUrl.emit();
                this.router.navigate(['/tabs/pedido-steps'], {replaceUrl: true});
            } else {
                this.appConfig.back();
            }
        });
    }

    ngOnDestroy() {
        this.backButtonSubscription.unsubscribe();
    }

    navigate(uri: string) {
        this.router.navigate(['/tabs/' + uri]);
    }

    private loadAuth() {
        this.oLoginProvider.loadAuth();
    }

    showFormRegister() {
        this.modalController.create({
            component: LoginPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                }
            });
        });
    }

    showButtonsRegister() {
        this.modalController.create({
            component: LoginButtonsPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                }
            });
        });
    }

}
