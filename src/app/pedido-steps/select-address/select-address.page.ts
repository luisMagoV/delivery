import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService, {RestApi} from '../../../providers/rest-service';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';
import {AddressPage} from '../../addresses/address';

/**
 * Generated class for the PayDebtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-select-address',
    styleUrls: ['select-address.scss'],
    templateUrl: 'select-address.html',
})
export class SelectAddressPage {

    categories;
    stores;
    products;
    items = [];
    category = '';
    store = '';
    product = '';
    directions = [];

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private rest: RestService,
        private modalCtrl: ModalController,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    loadAddress() {
        if (this.appConfig?.user?.directions) {
            this.appConfig?.user?.directions.forEach((direction: any) => {
                if (direction.favorite) {
                    this.appConfig.addressSelected = direction;
                    this.appConfig.hasFavorite = true;
                    this.appConfig.setFavorite.emit(true);
                }
            });
        }
    }

    setFavorite(uuid) {
        this.appConfig.showLoading();
        this.rest.route(RestApi.ADDRESS + '/' + uuid + '/favorite').withAuth().put().then((address: any) => {
            this.appConfig.hideLoading();
            if (this.appConfig.user.email) {
                this.rest.route(RestApi.PROFILE, this.appConfig.user.email).withAuth().get().then((profile: any) => {
                    this.appConfig.user.directions = profile.json().user.directions;
                    this.appConfig.hasFavorite = false;
                    this.loadAddress();
                }).catch(ex => {
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR ROUTE PROFILE',
                    });
                });
            }
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                buttons: [
                    {text: 'cerrar'},
                    {text: 'intentar de nuevo'},
                ],
            });
        });
    }

    goAddress() {
        this.modalCtrl.create({
            component: AddressPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then(data => {
                if (data.data) {
                    this.directions.push(data.data);
                    if (this.appConfig.user.email) {
                        this.rest.route(RestApi.PROFILE, this.appConfig.user.email).withAuth().get().then((profile: any) => {
                            this.appConfig.user.directions = profile.json().user.directions;
                            this.appConfig.hasFavorite = false;
                            this.loadAddress();
                        }).catch(ex => {
                            this.oConfigGlobalProvider.showErrorAlert({
                                message: ex,
                                title: 'ERROR ROUTE GO_ADDRESS PROFILE',
                            });
                        });
                    }
                }
            });
        });
    }

    removeAddress(index, id) {
        this.appConfig.showLoading();
        this.rest.route(RestApi.DEL_ADDRESS, id).withAuth().delete().then((address: any) => {
            this.directions = this.directions.filter((v, i) => i !== index);
            if (this.appConfig.user.email) {
                this.rest.route(RestApi.PROFILE, this.appConfig.user.email).withAuth().get().then((profile: any) => {
                    this.appConfig.user.directions = profile.json().user.directions;
                    this.appConfig.hasFavorite = false;
                    this.loadAddress();
                }).catch(ex => {
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR ROUTE DEL_ADDRESS PROFILE',
                    });
                });
            }
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR ROUTE DEL_ADDRESS',
            });
        });
    }

}
