import {Component, OnInit} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';
import {FormCardPage} from '../form-card/form-card';
import {ModalController} from '@ionic/angular';


/**
 * Generated class for the SelectPayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-select-pay',
    styleUrls: ['select-pay.scss'],
    templateUrl: 'select-pay.html',
})
export class SelectPayPage implements OnInit {

    cards;

    constructor(
        public appConfig: GlobalConfigProvider,
        private rest: RestService,
        private modalController: ModalController,
    ) {

    }

    ngOnInit() {
        this.appConfig.showLoading();
        this.listCards();
    }

    async back(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

    listCards() {
        this.rest.route(RestApi.CARDS).withAuth().get().then(res => {
            this.cards = res.json().cards;
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showAlert('Advertencia', 'Ha ocurrido un error, intente nuevamente', [
                {text: 'cerrar'},
                {text: 'Agregar tarjeta', handler: () => this.addCard()},
            ]);
        });
    }


    selectCard(card: any) {
        this.appConfig.cardS = card;
        this.appConfig.setStorage('cardSelected', card);
        this.modalController.dismiss(card);
    }

    addCard() {
        this.modalController.create({
            component: FormCardPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                    this.cards.push(data.data);
                }
            });
        });
    }

    addPayPal() {
    }

}
