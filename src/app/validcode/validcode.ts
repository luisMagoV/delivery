import {Component} from '@angular/core';
import RestService, {RestApi} from '../../providers/rest-service';
import {GlobalConfigProvider} from '../../providers/global-config';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../environments/environment';

@Component({
  selector: 'page-validcode',
  styleUrls: ['validcode.scss'],
  templateUrl: 'validcode.html',
})
export class ValidCodePage {
  email: string;
  code: string;

  constructor(
    private rest: RestService,
    private appConfig: GlobalConfigProvider,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
    this.email = data.email;
  }

  sendCode() {
    if (!this.code || this.code.length === 0) {
      this.appConfig.showAlert('Datos Requeridos', 'Ingrese el código de validación', ['Cerrar']);
      return;
    }

    this.appConfig.showLoading();
    this.rest.route(RestApi.VALID_CODE_EMAIL).withAuth().post({
      body: {
        code: this.code,
        email: this.email,
      },
    }).then(res => {
      this.appConfig.hideLoading();
      this.appConfig.showAlert('Código Valido', 'Bienvenido a ' +
        environment.nameApp + ', ya puedes disfrutar de nuestros servicios', [{
        text: 'Continuar',
        handler: () => this.goHome(),
      }]);
    }).catch(ex => {
      this.appConfig.hideLoading();
      if (ex.status === 400) {
        this.appConfig.showAlert('Código invalido', 'Ingrese otro código nuevamente', ['Entendido']);
        this.code = null;
      } else {
        this.appConfig.showErrorAlert();
      }
    });
  }

  private goHome() {
    this.router.navigate(['/'], {replaceUrl: true});
  }
}
