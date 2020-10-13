import {Component, OnInit} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ModalController} from '@ionic/angular';
import {GlobalConfigProvider} from '../../providers/global-config';
import {Router} from '@angular/router';

/**
 * Generated class for the ServicesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-services',
    styleUrls: ['services.scss'],
    templateUrl: 'services.html',
})
export class ServicesPage implements OnInit {
    serviceItems;
    lat: any;
    lng: any;
    imageUrl: any;
    wlocation: any;

    constructor(
        public http: Http,
        public appConfig: GlobalConfigProvider,
        public modalController: ModalController,
        private router: Router,
    ) {
        this.serviceItems = [];
        this.imageUrl = '';
        this.wlocation = false;
    }

    ngOnInit() {
        this.appConfig.getStorage('selectedPlace').then((place) => {
            // console.log(place);
        });
        this.appConfig.showLoading();

        const _headers: Headers = new Headers({
            'Content-Type': 'application/json',
            Authorization: 'JWT ' + this.appConfig.token,
        });
        const options: RequestOptions = new RequestOptions({headers: _headers});

        const body = JSON.stringify({
            latitude: this.appConfig.lat,
            longitude: this.appConfig.lng,
        });

        this.http.post(this.appConfig.apiBaseUrl + 'services/area', body, options).toPromise().then(response => {
            const bodyResponse = JSON.parse(response.text());
            if (bodyResponse.status === 'ok') {
                const me = this;
                me.serviceItems = [];
                bodyResponse.services.forEach((service) => {
                    me.serviceItems.push(service);
                });
                this.appConfig.hideLoading();
            } else {
            }
        }).catch((error: any) => {
            this.appConfig.hideLoading();
            const response = JSON.parse(error.text());
            if (response.code === 'error_no_services_in_area') {
                // show screen to send location
                this.wlocation = true;
                this.imageUrl = '../../assets/img/paisaje.png';
            } else {
                this.dismiss();
            }
        });
    }

    async dismiss(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

    chooseService(_service: any) {
        this.router.navigate([(_service.name === 'Mercado') ? '/tabs/supermarket' : '/tabs/service'], {
            queryParams: {
                data: JSON.stringify({service: _service}),
            },
        });
        this.dismiss();
    }
}
