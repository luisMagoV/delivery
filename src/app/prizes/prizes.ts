import {AlertController, ModalController} from '@ionic/angular';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';

@Component({
    selector: 'page-prizes',
    templateUrl: 'prizes.html',
    styleUrls: ['prizes.scss'],
})
export class PrizesPage implements OnInit {

    user: any;
    availablePoints = 0;
    giftcards: any[] = [];
    loadingGiftcards = false;
    loadingGiftcardsRequest = false;

    constructor(
        public appConfig: GlobalConfigProvider,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        private translateService: TranslateService,
        private alertCtrl: AlertController,
        private rest: RestService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.user = this.appConfig.user;
        this.availablePoints = this.user.points;
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngOnInit() {
        this.loadGiftcards();
    }

    loadGiftcards() {
        if (!this.loadingGiftcards) {
            this.loadingGiftcards = true;
            this.appConfig.showLoading();
            if (this.appConfig.user) {
                this.rest.routes('giftcard/list', 'v3').withAuth().get().then(res => {
                    this.giftcards = res.json().result;
                    this.appConfig.hideLoading();
                    this.loadingGiftcards = false;
                }).catch(ex => {
                    this.loadingGiftcards = false;
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR LOAD GIFTCARDS',
                    });
                });
            }
        }
    }

    loadGiftcardsRequest() {
        if (!this.loadingGiftcardsRequest) {
            this.loadingGiftcardsRequest = true;
            this.appConfig.showLoading();

            if (this.appConfig.user) {
                this.rest.routes('gift-request/list?usuario=' + this.user.uuid, 'v3').withAuth().get().then(res => {

                    this.availablePoints = res.json().result[2].points;

                    this.appConfig.hideLoading();
                    this.loadingGiftcardsRequest = false;
                }).catch(ex => {
                    this.loadingGiftcardsRequest = false;
                    const body = JSON.parse(ex._body);
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

    requestGiftcard(_giftcard) {
        this.rest.routes('gift-request/create', 'v3').withAuth().post({
            body: {
                userId: this.user.uuid,
                giftId: _giftcard.uuid,
            },
        }).then( () => {
            this.navigate('prizes/congrats');
        }).catch(ex => {
            const body = JSON.parse(ex._body);
            if (body.message === 'Insufficient points') {
                this.errorPuntos();
            } else {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'Ha ocurrido un error',
                });
            }
        });
    }

    async confirmacionPuntos(_giftcard) {
        const alert = await this.alertCtrl.create({
            header: 'Por favor confime',
            message: '¿Está seguro que desea hacer el canje de sus puntos por este premio?',
            buttons: [
                {text: 'Confirmar', handler: () => this.requestGiftcard(_giftcard)},
                {text: 'Cancelar', role: 'cancel'},
            ],
            cssClass: 'alertsPrize',
            mode: 'ios',
        });
        await alert.present();
    }

    async errorPuntos() {
        const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Usted no posee la catidad de puntos para canjear este premio o recompesa. Por favor siga acomulando puntos e inténtelo luego.',
            buttons: [
                {text: 'Cerrar', role: 'dismiss'},
            ],
            cssClass: 'alertsPrize',
            mode: 'ios',
        });
        await alert.present();
    }

    navigate(uri: string) {
        this.router.navigate(['/tabs/' + uri]);
    }

    back () {
        this.appConfig.back();
    }
}
