import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import RestService, {RestApi} from '../../providers/rest-service';
import {GlobalConfigProvider} from '../../providers/global-config';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';
import {PayMethodsPage} from '../pay-methods/pay-methods';
import {ModalController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {SelectPayPage} from '../select-pay/select-pay';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.page.html',
    styleUrls: ['profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

    info: any;
    banners: any[] = [];
    availablePoints = 0;
    giftcardsExchanged: any[] = [];
    loadingGiftcards = false;

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private rest: RestService,
        private modalController: ModalController,
        private route: ActivatedRoute,
        private router: Router,
        private socialSharing: SocialSharing,
    ) {
        this.info = this.appConfig.user;
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
        window.screen.orientation.lock('portrait');
    }

    ngOnInit() {
        this.info = this.appConfig.user;
        this.loadStuff();
        this.loadGiftcards();
    }

    ngOnDestroy() {
    }

    shared(code) {
        this.socialSharing.share(
            'Comparte a un amigo',
            'Gana créditos por cada referido',
            ['https://www.wearetogo.com&code=' + code],
        ).then(() => {
            }).catch(() => {
        });
    }


    gotoPedidos() {
        this.router.navigate(['/tabs/pedido'], {
            queryParams: {
                data: JSON.stringify({}),
            },
        });
    }

    changeCard() {
        this.modalController.create({
            component: SelectPayPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                    // this.cardSelected = data.data;
                }
            });
        });
    }

    showAddressSelector() {
        this.loadAddress();
        this.appConfig.hasFavorite = false;
    }

    showPayMethods() {
        this.modalController.create({
            component: PayMethodsPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                    // this.back({});
                }
            });
        });
    }

    loadAddress(dontEmit?: boolean) {
        if (this.appConfig?.user?.directions) {
            this.appConfig?.user?.directions.forEach((direction: any) => {
                if (direction.favorite) {
                    this.appConfig.addressSelected = direction;
                    this.appConfig.hasFavorite = true;
                    if (!dontEmit) {
                        this.appConfig.setFavorite.emit(true);
                    }
                }
            });
        }
    }

    loadGiftcards() {
        if (!this.loadingGiftcards) {
            this.loadingGiftcards = true;
            this.appConfig.showLoading();
            if (this.appConfig.user) {
                this.rest.routes('gift-request/list?usuario=' + this.info.uuid, 'v3').withAuth().get().then(res => {

                    this.availablePoints = res.json().result[2].points;

                    this.appConfig.hideLoading();
                    this.loadingGiftcards = false;
                }).catch(ex => {
                    const body = JSON.parse(ex._body);
                    if (body.message !== 'This user has not made requests') {
                        this.loadingGiftcards = false;
                        this.oConfigGlobalProvider.showErrorAlert({
                            message: ex,
                            title: 'ERROR LOAD GIFTCARDS',
                        });
                    } else {
                        this.appConfig.hideLoading();
                    }
                });
            }
        }
    }

    pay() {
        this.appConfig.showLoading();
        this.rest.route(RestApi.DEBTS).withAuth().post().then((res: any) => {
            res = JSON.parse(res.text());
            this.appConfig.hideLoading();
            if (res.status === 'ok') {
                this.appConfig.showAlert('Notificación', 'Pago realizado correctamente');
                this.info = res.user_updated[0];
                this.appConfig.user = res.user_updated[0];
            }
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });
    }

    /*
    loadStuff() {
        this.rest.routes('all-featured/', 'v3').withAuth().get().then(res => {
            res.json().banners.forEach((typeBanner) => {
                if (typeBanner.type === 'home') {
                    this.banners.push(typeBanner);
                }
            });
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD STUFF',
            });
        });
    }
     */

    loadStuff() {
        this.rest.routes('banners/list/', 'v3').withAuth().get().then(res => {
            res.json().result.forEach((typeBanner) => {
                if (typeBanner.type === 'profile') {
                    this.banners.push(typeBanner);
                }
            });
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD PROFILE BANNERS',
            });
        });
    }

    languageChange() {
        this.appConfig.setLang(this.appConfig.defaultLang);
    }

    close() {
        this.rest.setToken('');
        this.appConfig.resetConfig();
        this.oConfigGlobalProvider.user = null;
        this.appConfig.clearStorage();
        this.router.navigate(['/'], {replaceUrl: true});
    }

    navigate(uri: string) {
        this.router.navigate(['/tabs/' + uri]);
    }
}
