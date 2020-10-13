import {Component, OnInit} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {AlertController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {NotificationPermissionResponse, Plugins} from '@capacitor/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';
import * as firebase from 'firebase';
import {PushService} from '../../providers/push.service';
import DataSnapshot = firebase.database.DataSnapshot;

const {LocalNotifications} = Plugins;

/**
 * Generated class for the StatusOrderPage page.
 *
 * See https://ionicframework.comcΩ/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-status-order',
    styleUrls: ['status-order.scss'],
    templateUrl: 'status-order.html',
})
export class StatusOrderPage implements OnInit {
    public order: any;
    orders = [];
    items: any;
    _todosRef: any;
    asignKangu = false;
    statusOrders = [];
    load = 0;
    kangu: any = {
        name: '',
        phone: '',
        path: '',
    };
    orderAct;
    cancelActive = false;
    ratevalue = 0;
    ratingnow = false;
    message = '';
    loadFirst = true;
    noCancel = false;
    noCancelLoad = false;
    orderOrigin;
    typeLoad: any;

    rateMsg = ['Pésimo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

    messageStatus = {
        approved: 'Orden procesada',
        taken: 'Su orden ha sido tomada',
        completed: 'Orden completada',
        returned: 'Domiciliario en camino',
        sold: 'Productos comprados',
        bought: 'Monto de la compra',
        'in progress': 'Su orden está en progreso',
        'canceled by client': 'Orden cancelada por el cliente',
        'canceled by platform': 'Cancelada',
        'canceled by domiciliary': 'Orden cancelada por Domiciliario',
    };

    constructor(
        public appConfig: GlobalConfigProvider,
        public alertCtrl: AlertController,
        public http: Http,
        private translateService: TranslateService,
        private rest: RestService,
        private route: ActivatedRoute,
        private router: Router,
        public oPushService: PushService,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
        this.loadData();
        this.router.events.subscribe(m => {
            if (m instanceof NavigationEnd) {
                if (m.url.startsWith('/tabs/status-order')) {
                    this.loadData();
                    this.loadAll();
                }
            }
        });
    }

    loadData() {
        const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
        this.orderOrigin = data.order;
        this.typeLoad = data.type;
        this.statusOrders = [];
        this.load = 1;
        this.ratingnow = false;
        this.asignKangu = false;
        if (this.typeLoad === 2) {
            this.noCancelLoad = true;
        }
        this.orderAct = this.orderOrigin;
    }

    loadAll() {
        switch (this.orderOrigin.status) {
            case 'created':
                this.subscribe();
                break;
            case 'completed':
                this.loadHistory();
                break;
            default:
                this.loadHistory(this.orderOrigin.status);
        }
    }

    ngOnInit() {
        this.loadAll();
    }

    rate(rate: number) {
        this.ratevalue = rate;
        this.rating();
    }

    rating() {
        if (this.message.length > 0) {
            this.appConfig.showAlert('Atención', 'Si acepta se enviará la clasificación', ['No', {
                text: 'Aceptar', handler: () => {
                    this.exit();
                },
            }]);
        } else if (this.ratevalue > 0) {
            this.appConfig.showAlert('Atención', 'Si acepta se enviará la clasificación sin mensaje', ['No', {
                text: 'Aceptar', handler: () => {
                    this.exit();
                },
            }]);
        } else {
            this.showOrders();
        }
    }

    exit() {
        this.appConfig.showLoading();
        this.rest.route(RestApi.RATING).withAuth().post({
            body: {
                order: this.orderOrigin.uuid,
                rate: this.ratevalue,
                message: this.message,
            },
        }).then(res => {
            this.ratevalue = 0;
            this.appConfig.hideLoading();
            this.showOrders();
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });
    }

    loadHistory(subscribe?: boolean) {
        this.rest.route(RestApi.ORDERS_STATUS, this.orderOrigin.uuid).withAuth().get().then(res => {
            const body = res.json();
            const statuses = body.statuses;

            for (const val of statuses) {
                let or = this.orderOrigin.order || this.orderOrigin;
                or = JSON.parse(JSON.stringify(or));
                if (val.status === 'created') {
                    continue;
                }
                or.status = val.status;
                const order = body;
                order.order = or;
                order.created_at = '';
                order.order_uuid = or.uuid;
                order.uuid = or.uuid;
                this.orderOrigin = order;
                this.addStatus(order);
            }
            if (subscribe) {
                this.subscribe();
            }
            if (this.loadFirst) {
                this.loadFirst = false;
            }
        });
    }

    subscribe() {
        const ref = firebase.database().ref('/notifications/' + this.appConfig.uid);

        ref.on('value', (dataSnapshot: DataSnapshot) => {
            dataSnapshot.forEach((orderSnapshot: DataSnapshot) => {
                const orderVal = orderSnapshot.val();

                if (orderVal.order.uuid === this.orderOrigin.uuid) {
                    let exist = false;
                    if (!this.orderOrigin?.statuses || orderVal.order.status === 'taken') {
                        this.loadHistory(false);
                        return;
                    }

                    this.orderOrigin.statuses.forEach((status) => {
                        if (status.status === orderVal.order.status) {
                            exist = true;
                        }
                    });

                    if (!exist) {
                        this.orderOrigin.statuses.push({
                            createdAt: orderVal.order.createdAt,
                            id: orderVal.order.id,
                            order: orderVal.order.uuid,
                            status: orderVal.order.status,
                            updatedAt: orderVal.order.updatedAt,
                        });
                    }
                    this.addStatus(orderVal);
                    firebase.database().ref('/notifications/' + this.appConfig.uid + '/' + dataSnapshot.key).remove(); // elimina hijos

                    if (this.loadFirst) {
                        this.loadFirst = false;
                    }
                }
            });
        });
        this.appConfig.setFirebaseRef(ref);
    }

    addStatus(order): void {
        if (order.order.amount_paid) {
            this.orderOrigin.order.amount_paid = order.order.amount_paid;
        }
        let exist = false;
        this.orderAct = order;
        for (const o of this.statusOrders) {
            if (o.order.id === order.order.id) {
                exist = true;
            }
            if (o.order.status === order.order.status) {
                return;
            }
        }
        if (!this.loadFirst) {
            LocalNotifications.requestPermission().then((granted: NotificationPermissionResponse) => {
                if (granted.granted) {
                    LocalNotifications.schedule({
                        notifications: [
                            {
                                title: 'Orden',
                                body: this.messageStatus[order.order.status],
                                id: (new Date()).getTime(),
                                schedule: {at: new Date(Date.now() + 100)},
                                smallIcon: 'assets/img/logo.png',
                                sound: 'assets/sound/short.mp3',
                                actionTypeId: '',
                                attachments: null,
                                extra: null,
                            },
                        ],
                    });
                }
            });
        }

        switch (order.order.status) {
            case 'completed':
                this.statusOrders.push(order);
                this.ratingnow = true;
                break;
            case 'canceled by client':
            case 'canceled by platform':
                this.statusOrders.push(order);
                this.cancelActive = true;
                this.appConfig.removeFirebaseRef();
                break;
            case 'in progress':
                this.statusOrders.push(order);
                this.noCancel = true;
                break;
            case 'taken':
                this.statusOrders.push(order);
                this.asignKangu = true;
                break;
            case 'approved':
                this.statusOrders.push(order);
                exist = true;
                break;
            default:
        }

        if (!exist) {
            // this.statusOrders.push(order);
            exist = true;
        }
    }

    chat() {
        this.router.navigate(['/tabs/chat'], {queryParams: {data: JSON.stringify({order: this.orderOrigin})}});
    }

    showOrders() {
        this.router.navigate(['/tabs/pedido'], {replaceUrl: true});
    }

    closeScreen() {
        // valid position
        if (this.typeLoad === 2) {
            this.router.navigate(['/tabs/pedido-steps'], {replaceUrl: true});
        } else {
            this.appConfig.back();
        }
    }

    cancelOrder() {
        if (this.cancelActive === false) {
            this.alertCtrl.create({
                header: 'Cancelar Orden',
                message: '¿Deseas cancelar la orden?',
                buttons: [
                    {
                        text: 'Continuar',
                        role: 'cancel',
                        handler: () => {
                            // console.log('Cancel clicked');
                        },
                    },
                    {
                        text: 'Si, Cancelar',
                        handler: () => {
                            // cancel orden
                            this.appConfig.showLoading();
                            const _headers: Headers = new Headers({
                                'Content-Type': 'application/json',
                                Authorization: 'JWT ' + this.appConfig.token,
                            });
                            const options: RequestOptions = new RequestOptions({headers: _headers});
                            const body = JSON.stringify({
                                status: 'canceled by client',
                            });
                            this.http
                                .put(this.appConfig.apiBaseUrl + 'orders/' + this.orderOrigin.uuid + '/status', body, options)
                                .toPromise().then(
                                response => {
                                    const bodyResponse = JSON.parse(response.text());
                                    if (bodyResponse.status === 'ok') {
                                        const tmpOrder = {
                                            status: bodyResponse.order.status,
                                            msg: 'Lamentamos la falla',
                                        };
                                        const tmpOrderData = {
                                            created_at: bodyResponse.order.updatedAt,
                                            order: tmpOrder,
                                            message: 'Orden cancelada',
                                        };
                                        this.oPushService.sendFCM({
                                            title: 'Orden',
                                            body: 'Orden cancelada',
                                        }, ['domiciliary_' + this.order.domiciliary._id]);
                                        this.addStatus(tmpOrderData);
                                        this.cancelActive = true;
                                        this.appConfig.hideLoading();
                                        this.appConfig.removeFirebaseRef();
                                    } else {
                                        this.appConfig.hideLoading();
                                        // console.log('LOG: GENERATE ERROR TO CREATE ORDER');
                                    }
                                }).catch((error: any) => {
                                this.appConfig.hideLoading();
                            });
                        },
                    },
                ],
            }).then(a => a.present());
        } else {
            this.showOrders();
        }
    }
}
