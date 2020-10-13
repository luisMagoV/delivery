import {Component} from '@angular/core';
import {DeviceInfo, Plugins} from '@capacitor/core';
import {Platform} from '@ionic/angular';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as firebase from 'firebase';
import {ConfigGlobalProvider} from '../providers/config.global.provider';
import {GlobalConfigProvider} from '../providers/global-config';
import {PushService} from '../providers/push.service';

const {Device} = Plugins;

@Component({
    selector: 'app-root',
    styleUrls: ['app.component.scss'],
    template: `
        <ion-app>
            <ion-router-outlet></ion-router-outlet>
        </ion-app>
    `,
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private translateService: TranslateService,
        public appConfig: GlobalConfigProvider,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public oPushService: PushService,
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            Device.getInfo().then((deviceInfo: DeviceInfo) => {
                this.oConfigGlobalProvider.device = deviceInfo;
                this.appConfig.device = deviceInfo;
                firebase.initializeApp(this.oConfigGlobalProvider.environment.firebaseConfig);
                this.oPushService.register();
                this.appConfig.initLang();
                this.translateService.setDefaultLang(this.appConfig.defaultLang);
                this.appConfig.currentLang.subscribe(lang => {
                    this.translateService.use(lang);
                });
            });
        });
    }
}
