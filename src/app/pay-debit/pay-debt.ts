import {Component, OnInit} from '@angular/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';

/**
 * Generated class for the PayDebtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-pay-debt',
  styleUrls: ['pay-debt.scss'],
  templateUrl: 'pay-debt.html',
})
export class PayDebtPage implements OnInit {
  info: any;

  constructor(
    private appConfig: GlobalConfigProvider,
    private rest: RestService,
  ) {
    this.info = this.appConfig.user;
  }

  ngOnInit() {
    this.info = this.appConfig.user;
  }

  pay() {
    this.appConfig.showLoading();
    this.rest.route(RestApi.DEBTS).withAuth().post().then(res => {
      const response = JSON.parse(res.text());
      this.appConfig.hideLoading();
      if (response.status === 'ok') {
        this.appConfig.showAlert('Notificación', 'Pago realizado correctamente');
        this.info = response.user_updated[0];
        this.appConfig.user = response.user_updated[0];
      }
    }).catch(ex => {
      this.appConfig.hideLoading();
      this.appConfig.showErrorAlert();
    });
  }

}
