import {Component} from '@angular/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'page-create-password',
    styleUrls: ['create-password.scss'],
    templateUrl: 'create-password.html',
})
export class CreatePasswordPage {
    showPass = false;
    firstName = '';
    lastName = '';
    phone = '';
    email = '';
    referredBy = '';
    password = '';
    type = 'password';

    constructor(
        public appConfig: GlobalConfigProvider,
        private rest: RestService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
        this.firstName = data?.firstName || this.appConfig?.user?.name || '';
        this.lastName = data?.lastName || this.appConfig?.user?.lastName || '';
        this.phone = data?.phone || this.appConfig?.user?.phone || '';
        this.referredBy = '';
    }

    showPassword() {
        this.showPass = !this.showPass;
        this.type = (this.showPass) ? 'text' : 'password';
    }

    next() {
        // valid exist data in form to update user
        if (this.appConfig?.user?.email) {
            if (!this.email) {
                this.appConfig.showAlert('Datos Requeridos', 'Complete sus datos', ['Cerrar']);
                return;
            }
            if (!this.appConfig.isEmail(this.email)) {
                this.appConfig.showAlert('Datos Requeridos', 'Escribe un email', ['Cerrar']);
                return;
            }
        }
        if (!this.firstName || !this.lastName || !this.password) {
            this.appConfig.showAlert('Datos Requeridos', 'Complete sus datos', ['Cerrar']);
            return;
        }

        const _body: any = {
            name: this.firstName,
            lastName: this.lastName,
            password: this.password,
            phone: this.phone,
            referredBy: this.referredBy,
        };

        if (this.appConfig?.user?.email) {
            _body.email = this.email;
        }

        this.appConfig.showLoading();
        this.rest.route(RestApi.PUT_PROFILE).withAuth().put({body: _body}).then(res => {
            this.appConfig.hideLoading();
            this.appConfig.user.name = this.firstName;
            this.appConfig.user.lastName = this.firstName;
            this.appConfig.user.email = this.email;
            this.appConfig.user.password = this.password;
            this.appConfig.user.phone = this.phone;
            if (this.appConfig?.user?.email) {
                this.router.navigate(['/tabs/validate'], {queryParams: {data: JSON.stringify({email: this.email})}});
            } else {
                this.router.navigate(['/'], {replaceUrl: true});
            }
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });
    }
}
