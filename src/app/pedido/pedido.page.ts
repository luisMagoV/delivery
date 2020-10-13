import {AfterViewInit, Component} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import RestService, {RestApi} from '../../providers/rest-service';
import {GlobalConfigProvider} from '../../providers/global-config';
import {DetailOrderPage} from '../detail-order/detail-order';
import {ProductOpinionPage} from '../product-opinion/product-opinion';

@Component({
    selector: 'app-pedido',
    templateUrl: 'pedido.page.html',
    styleUrls: ['pedido.page.scss'],
})
export class PedidoPage implements AfterViewInit {

    pedidos: any[];
    antiguos: any[];
    thereOrders: boolean = null;
    segment = 'pedidos';
    status = {
        approved: ['Aprobado', 15],
        taken: ['Orden tomada', 30],
        'in progress': ['Camino a entrega', 40],
        sold: ['Productos comprados', 60],
        returned: ['Camino a entrega', 80],
        completed: ['Completada', 100],
        'canceled by platform': ['Cancelado por plataforma', 0],
        'canceled by client': ['Cancelado por el cliente', 0],
    };

    constructor(
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private rest: RestService,
        private modalCtrl: ModalController,
        private router: Router,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngAfterViewInit() {
        this.load();
        this.router.events.subscribe(m => {
            if (m instanceof NavigationEnd) {
                if (m.url.startsWith('/tabs/pedido')) {
                    this.load();
                }
            }
        });
    }

    load() {
        this.appConfig.showLoading();
        this.rest.route(RestApi.ORDERS).withAuth().get().then(res => {
            this.appConfig.hideLoading();
            this.analyze(res.json().orders);
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert([
                {text: 'cerrar'},
                {text: 'intentar de nuevo', handler: () => this.load()},
            ]);
        });
    }

    analyze(items: any[]) {
        if (items.length > 0) {
            this.thereOrders = true;
            this.pedidos = [];
            this.antiguos = [];
            items.forEach((v, i) => {
                switch (v.status) {
                    case 'approved':
                    case 'taken':
                    case 'in progress':
                    case 'sold':
                    case 'created':
                    case 'returned':
                        this.pedidos.push(v);
                        break;
                    case 'completed':
                    case 'canceled by platform':
                    case 'canceled by client':
                        this.antiguos.push(v);
                        break;
                }
            });
        } else {
            this.thereOrders = false;
        }
    }

    goOrderStatus(index: number) {
        this.router.navigate(['/tabs/status-order'], {
            queryParams: {
                data: JSON.stringify({
                    order: this.pedidos[index],
                    type: 2,
                }),
            },
        });
    }

    showOrder(_order) {
        this.modalCtrl.create({
            component: DetailOrderPage,
            componentProps: {order: _order},
        }).then((m) => {
            m.present();
        });
    }

    productOpinion(_store) {
        this.modalCtrl.create({
            component: ProductOpinionPage,
            componentProps: {store: _store},
        }).then((m) => {
            m.present();
        });
    }

    goOrder() {
        this.router.navigate(['/tabs/pedido-steps']);
    }

}
