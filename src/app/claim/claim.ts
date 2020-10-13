import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import RestService, {RestApi} from '../../providers/rest-service';
import {GlobalConfigProvider} from '../../providers/global-config';

/**
 * Generated class for the ClaimPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-claim',
    styleUrls: ['claim.scss'],
    templateUrl: 'claim.html',
})
export class ClaimPage {
    order: any;
    claim: any;
    message: any;
    sent: any;

    constructor(
        private rest: RestService,
        private appConfig: GlobalConfigProvider,
        private route: ActivatedRoute,
    ) {
        const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
        this.order = data.order;
        this.claim = data.claim;
        this.message = '';
        this.sent = false;
    }

    send() {
        this.appConfig.showLoading();
        this.rest.route(RestApi.CLAIMS).withAuth().post({
            body: {
                content: this.message.trim(),
                type: this.claim.uuid,
                order: this.order.uuid,
            },
        }).then(res => {
            this.message = '';
            this.appConfig.hideLoading();
            this.appConfig.showAlert('Reclamo', 'Mensaje enviado con éxito');
            this.sent = true;
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });
    }

}
