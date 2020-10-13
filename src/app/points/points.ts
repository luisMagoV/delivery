import {Component, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';

/**
 * Generated class for the ProductDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-points',
    styleUrls: ['points.scss'],
    templateUrl: 'points.html',
})
export class PointsPage {

    @Input() public product: any;
    @Input() public store: any;

    constructor(
        public modalController: ModalController,
    ) {
    }

    dismiss(add?: boolean) {
        this.modalController.dismiss(add ? {add: true} : {});
    }
}
