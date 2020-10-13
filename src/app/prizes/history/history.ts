import {AlertController, ModalController} from '@ionic/angular';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService, {RestApi} from '../../../providers/rest-service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';

@Component({
    selector: 'page-history',
    templateUrl: 'history.html',
    styleUrls: ['history.scss'],
})
export class HistoryPage implements OnInit {

    user: any;
    accumulatedPoints = 0;
    exchangedPoints = 0;
    availablePoints = 0;
    giftcardsExchanged: any[] = [];
    loadingGiftcards = false;

    constructor(
        public appConfig: GlobalConfigProvider,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        private translateService: TranslateService,
        private rest: RestService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngOnInit() {
        this.user = this.appConfig.user;
        this.loadGiftcards();
    }

    loadGiftcards() {
        if (!this.loadingGiftcards) {
            this.loadingGiftcards = true;
            this.appConfig.showLoading();
            if (this.appConfig.user) {
                this.rest.routes('gift-request/list?usuario=' + this.user.uuid, 'v3').withAuth().get().then(res => {

                    this.accumulatedPoints = res.json().result[0].points;
                    this.exchangedPoints = res.json().result[1].points;
                    this.availablePoints = res.json().result[2].points;
                    this.giftcardsExchanged = res.json().result[3].operations;

                    this.appConfig.hideLoading();
                    this.loadingGiftcards = false;
                }).catch(ex => {
                    this.availablePoints = this.user.points;
                    this.accumulatedPoints = this.user.points;
                    this.loadingGiftcards = false;
                    const body = JSON.parse(ex._body);
                    if (ex.status === 400) {
                        this.appConfig.hideLoading();
                    }
                    if (body.message !== 'This user has not made requests') {
                        this.oConfigGlobalProvider.showErrorAlert({
                            message: ex,
                            title: 'ERROR LOAD GIFTCARD',
                        });
                    }
                });
            }
        }
    }

    navigate(uri: string) {
        this.router.navigate(['/tabs/' + uri]);
    }
}
