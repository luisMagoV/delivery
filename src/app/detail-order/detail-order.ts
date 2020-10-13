import {AfterViewInit, Component, Input} from '@angular/core';
import RestService, {RestApi} from '../../providers/rest-service';
import {GlobalConfigProvider} from '../../providers/global-config';
import {ModalController} from '@ionic/angular';
import {NavigationEnd, Router} from '@angular/router';

/**
 * Generated class for the DetailOrderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-detail-order',
    styleUrls: ['detail-order.scss'],
    templateUrl: 'detail-order.html',
})
export class DetailOrderPage implements AfterViewInit {
    @Input() order: any;
    data: any = [];
    avg = '';
    priceComplete = 0;
    itbmsComplete = 0;
    priceCompleteWithItbms = 0;
    delivery = 0;
    status = {
        approved: ['Aprobado', 15],
        taken: ['Orden tomada, comprador saliendo', 30],
        'in progress': ['En camino para llevar tus productos', 40],
        sold: ['Compra exitosa', 60],
        returned: ['Producto retornado', 80],
        completed: ['Completada', 100],
        'canceled by platform': ['Cancelado por plataforma', 0],
        'canceled by client': ['Cancelado por el cliente', 0],
    };

    constructor(
        private rest: RestService,
        private appConfig: GlobalConfigProvider,
        public modalController: ModalController,
        private router: Router,
    ) {
        this.appConfig.showLoading();
        this.appConfig.getStorage('average').then(average => {
            if (average) {
                this.avg = average;
            }
        });

        this.rest.route(RestApi.CLAIMSTYPE).withAuth().get().then(res => {
            this.data = JSON.parse(res.text());
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.appConfig.hideLoading();
            // this.appConfig.showErrorAlert();
        });
    }

    ngAfterViewInit() {
        // console.log(this.order);
        this.calculate();
    }

    calculate() {
        this.itbmsComplete = 0;
        this.priceComplete = 0;
        this.priceCompleteWithItbms = 0;
        this.delivery = this.order?.cost || 0;
        if (this.order.service.name === 'Tiendas') {
            if (this.order.stores.length > 0) {
                this.order.stores.forEach((store: any) => {
                    store.prods.forEach((products: any) => {
                        this.itbmsComplete += products.product.itbms * products.quantity;
                        this.priceComplete += products.product.price * products.quantity;

                        return products;
                    });

                    return store;
                });
            } else {
                this.order.products.forEach((products: any) => {
                    this.itbmsComplete += (products?.product?.itbms || products?.itbms || 0) * products.quantity;
                    this.priceComplete += (products?.product?.price || products?.price || 0) * products.quantity;

                    return products;
                });
            }
        }
        this.priceCompleteWithItbms = this.priceComplete + this.delivery + this.itbmsComplete;
    }

    async dismiss(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

    createClaim(_claim) {
        this.router.navigate(['/tabs/claim'], {
            queryParams: {
                data: JSON.stringify({
                    claim: _claim,
                    order: this.order,
                }),
            },
        });
    }

}
