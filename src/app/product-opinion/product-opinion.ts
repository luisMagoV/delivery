import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService from '../../providers/rest-service';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';

/**
 * Generated class for the ProductDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-product-opinion',
    styleUrls: ['product-opinion.scss'],
    templateUrl: 'product-opinion.html',
})
export class ProductOpinionPage implements OnInit {



    @Input() public product: any;
    @Input() public store: any;
    user: any;
    opinions = [];
    textOpinion = '';
    stars = 0;
    storeAv: 0;

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private rest: RestService,
        public modalController: ModalController,
    ) {
        this.user = this.appConfig.user;
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngOnInit(): void {
        this.loadOpinions();
    }
    loadOpinions() {
        this.appConfig.showLoading();
        this.rest.routes('opinion?entity=' + this.store.uuid, 'v3').withAuth().get().then((opinions: any) => {
            this.opinions = opinions.json().result;
            this.storeAv = opinions.json().average_store;
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD OPNIONS',
            });
        });
    }

    ratingOrder(rating) {
        this.stars = rating;
    }

    saveOpinion() {
        if (this.stars != null) {
            this.rest.routes('opinion', 'v3').withAuth().post({
                body: {
                    user: this.user.uuid,
                    opinion: this.textOpinion,
                    store: this.store.uuid,
                    stars: this.stars,
                },
            }).then(res => {
                this.dismiss();
            }).catch(ex => {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'Error al guardar',
                });
            });
        }
    }

    dismiss(add?: boolean) {
        this.modalController.dismiss(add ? {add: true} : {});
    }
}
