import {Component} from '@angular/core';
import {Router} from '@angular/router';

/**
 * Generated class for the FinalOrderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-final-order',
    styleUrls: ['final-order.scss'],
    templateUrl: 'final-order.html',
})
export class FinalOrderPage {

    constructor(
        private router: Router,
    ) {
    }

    goInit() {
        this.router.navigate(['/tabs/pedido-steps'], {replaceUrl: true});
    }

    showOrders() {
        this.router.navigate(['/tabs/pedido'], {replaceUrl: true});
    }

}
