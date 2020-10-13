import {Component, Input, OnInit} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Geolocation} from '@ionic-native/geolocation/ngx';
import {GlobalConfigProvider} from '../../providers/global-config';
import {ModalController} from '@ionic/angular';
import RestService, {RestApi} from '../../providers/rest-service';
import {ActivatedRoute, Router} from '@angular/router';
import {SelectPayPage} from '../select-pay/select-pay';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';

/**
 * Generated class for the PreordenPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-pay-methods',
    styleUrls: ['pay-methods.scss'],
    templateUrl: 'pay-methods.html',
})
export class PayMethodsPage implements OnInit {

    cards;

    constructor(
        public http: Http,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private geolocation: Geolocation,
        private rest: RestService,
        private modalController: ModalController,
        private route: ActivatedRoute,
        private router: Router,
    ) {
    }

    back(data?: any) {
        this?.modalController?.dismiss(data);
    }

    ngOnInit() {
        this.appConfig.changeUrl.subscribe(() => this.back({}));
        this.listCards();
    }

    listCards() {
        this.rest.route(RestApi.CARDS).withAuth().get().then(res => {
            this.cards = res.json().cards;
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showAlert('ERROR LIST CARD', ex,
                [
                    {text: 'Cerrar'},
                    {text: 'Volver a intentar', handler: () => this.listCards()},
                ],
            );
        });
    }

    addCard() {
        this.modalController.create({
            component: SelectPayPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                    this.cards.push(data.data);
                }
            });
        });
    }
}
