import {Component} from '@angular/core';
import {AlertController, NavController} from '@ionic/angular';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';

@Component({
    selector: 'app-tab3',
    templateUrl: 'settings.page.html',
    styleUrls: ['settings.page.scss'],
})
export class SettingsPage {

    ntf = false;

    constructor(
        public navCtrl: NavController,
        public appConfig: GlobalConfigProvider,
        public rest: RestService,
        public alertCtrl: AlertController,
    ) {
        this.appConfig.getStorage('ntf').then(value => {
            if (!value) {
                this.ntf = value;
            }
        });
    }

    notification() {
        this.appConfig.setStorage('ntf', !this.ntf);
    }

    sesion() {
        this.alertCtrl.create({
            header: '¡Atención!',
            subHeader: 'Estas seguro de querer cerrar sesión',
            buttons: [{
                text: 'No',
            }, {
                text: 'Si',
                handler: () => this.close(),
            }],
        }).then((a) => a.present());
    }

    close() {
        this.rest.setToken('');
        this.appConfig.token = '';
        this.appConfig.user = null;
        this.appConfig.uid = null;
        this.appConfig.cardS = '';
        this.appConfig.removeStorage('user');
        this.appConfig.removeStorage('uid');
        this.appConfig.removeStorage('token');
        this.appConfig.page = 0;
    }

    sendService(_service) {
        this.appConfig.showLoading();
        this.rest.route(RestApi.REQUEST_SERVICE).withAuth().post({body: {service: _service}}).then(res => {
            const response = JSON.parse(res.text());
            this.appConfig.hideLoading();
            if (response.status === 'ok')
                this.appConfig.showAlert('Notificación', 'Te avisaremos cuando el servicio esté disponible');
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });
    }

}
