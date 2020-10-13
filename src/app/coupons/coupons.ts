import {AfterViewInit, Component} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import RestService, {RestApi} from '../../providers/rest-service';
import {GlobalConfigProvider} from '../../providers/global-config';
import {DetailOrderPage} from '../detail-order/detail-order';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';

@Component({
    selector: 'app-coupons',
    templateUrl: 'coupons.html',
    styleUrls: ['coupons.scss'],
})
export class CouponsPage implements AfterViewInit {

    loadingCoupons = false;
    disponibles: any[];
    vencidos: any[];
    thereCoupons: boolean = null;
    segment = 'pedidos';
    coupon = '';
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
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private rest: RestService,
        private modalCtrl: ModalController,
        private alertCtrl: AlertController,
        private router: Router,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngAfterViewInit() {
        this.loadCoupons();
    }

    loadCoupons() {
        if (!this.loadingCoupons) {
            this.loadingCoupons = true;
            this.appConfig.showLoading();
            if (this.appConfig.user) {
                this.rest.routes('coupons/', 'v3').withAuth().get().then(res => {
                    this.analyze(res.json());
                    this.appConfig.hideLoading();
                    this.loadingCoupons = false;
                }).catch(ex => {
                    this.loadingCoupons = false;
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR LOAD COUPONS',
                    });
                });
            }
        }
    }

    cashCoupon() {
        this.rest.routes('coupons/claim/' + this.coupon, 'v3').withAuth().get().then(res => {
            this.loadCoupons();
        }).catch(ex => {
            const body = JSON.parse(ex._body);
            if (body.error === 'No se encontro cupon') {
                this.errorCupones();
            } else {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR CASHING COUPON',
                });
            }
        });
        this.coupon = '';
    }

    analyze(items: any[]) {
        if (items.length > 0) {
            this.thereCoupons = true;
            this.disponibles = [];
            this.vencidos = [];
            const today = new Date();
            items.forEach((v, i) => {
                const expireDate = new Date(v.valid_until);
                if ( today > expireDate ) {
                    this.vencidos.push(v);
                } else {
                    this.disponibles.push(v);
                }
            });
        } else {
            this.thereCoupons = false;
        }
    }

    async errorCupones() {
        const alert = await this.alertCtrl.create({
            header: 'Cúpon No Disponible',
            message: 'Es posible que el cupón que usted esta intentando canjear sea invalido o haya expirado. ' +
                'Por favor, asegurese que el codigo que está ingresando sea el correcto e intentelo nuevamente.',
            buttons: [
                {text: 'Cerrar', role: 'dismiss'},
            ],
            cssClass: 'alertsPrize',
            mode: 'ios',
        });
        await alert.present();
    }

    goOrderStatus(index: number) {
        this.router.navigate(['/tabs/status-order'], {
            queryParams: {
                data: JSON.stringify({
                    order: this.disponibles[index],
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


}
