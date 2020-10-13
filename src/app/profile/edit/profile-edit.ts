import {AlertController, ModalController} from '@ionic/angular';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService, {RestApi} from '../../../providers/rest-service';
import {AddressPage} from '../../addresses/address';
import {Router} from '@angular/router';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';
import {FormCardPage} from '../../form-card/form-card';
import {CameraPhoto, CameraResultType, CameraSource, Plugins} from '@capacitor/core';
import {LoginProvider} from '../../../providers/login.provider';

@Component({
    selector: 'page-profile-edit',
    templateUrl: 'profile-edit.html',
    styleUrls: ['profile-edit.scss'],
})
export class ProfileEditPage implements OnInit {

    info: any;
    @ViewChild('avatar') avatarElement: ElementRef;
    changeAvatar = false;

    constructor(
        public appConfig: GlobalConfigProvider,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        private translateService: TranslateService,
        private oLoginProvider: LoginProvider,
        private rest: RestService,
        private modalCtrl: ModalController,
        public alertCtrl: AlertController,
        private router: Router,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
        this.info = {};
    }

    ngOnInit() {
        if (this.appConfig.uid) {
            this.appConfig.showLoading();
            this.rest.route(RestApi.USERS, this.appConfig.uid).withAuth().get().then(res => {
                this.appConfig.user = res.json().user;
                this.info.name = this.appConfig.user.name;
                this.info.lastName = this.appConfig.user.lastName;
                this.info.fullname = this.appConfig.user.name + ' ' + this.appConfig.user.lastName;
                this.info.phone = this.appConfig.user.phone.length > 0 ? this.appConfig.user.phone[0].phone : '';
                this.info.email = this.appConfig.user.email;
                this.info.gender = this.appConfig.user.gender;
                this.info.birthdate = this.appConfig.user.birthdate;
                this.info.directions = this.appConfig.user.directions;
                this.info.uuid = this.appConfig.user.uuid;
                this.info.avatar = this.appConfig.user.avatar;
                this.appConfig.hideLoading();
            }).catch(ex => {
                this.appConfig.hideLoading();
                this.appConfig.showErrorAlert([
                    {text: 'cerrar'},
                    {text: 'intentar de nuevo', handler: () => this.ngOnInit()},
                ]);
            });

            this.rest.route(RestApi.CARDS).withAuth().get().then(res => {
                this.info.cards = res.json().cards;
            });
        }
    }

    openFileChooser() {
        this.appConfig.showLoading();
        Plugins.Camera.getPhoto({
            quality: 30,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Photos,
        }).then((cameraPhoto: CameraPhoto) => {
            this.changeAvatar = true;
            this.info.avatar = 'data:image/' + cameraPhoto.format + ';base64,' + cameraPhoto.base64String;
            this.appConfig.hideLoading();

            return cameraPhoto.webPath;
        }).catch((ex) => {
            this.appConfig.hideLoading();
        });
    }

    save() {
        this.getNames();
        const userInfo = {
            uuid: this.info.uuid,
            phone: this.info.phone,
            name: this.info.name,
            lastName: this.info.lastName,
            email: this.info.email,
            gender: this.info.gender,
            birthdate: this.info.birthdate,
        };
        this.appConfig.showLoading();
        this.rest.route(RestApi.PUT_PROFILE, this.appConfig.user.email).withAuth().put({body: userInfo}).then(data => {
            // mensaje de actualizado
            this.appConfig.hideLoading();
            this.appConfig.user.name = userInfo.name;
            this.appConfig.user.lastName = userInfo.lastName;
            this.appConfig.user.email = userInfo.email;
            this.appConfig.user.phone = userInfo.phone;
            this.appConfig.user.gender = userInfo.gender;
            this.appConfig.user.birthdate = userInfo.birthdate;
        }).catch(ex => {
            // mensaje error al grabar
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });

        if (this.changeAvatar) {
            this.rest.route(RestApi.PUT_AVATAR).withAuth().put({body: {avatar: this.info.avatar}}).then(data => {
                // this.appConfig.hideLoading();
                this.appConfig.user.avatar = this.info.avatar;
                this.changeAvatar = false;
            }).catch(ex => {
                // this.appConfig.hideLoading();
                this.appConfig.showErrorAlert();
            });
        }
    }

    getNames(): string {
        if (this.info.fullname) {
            const index = this.info.fullname.trim().indexOf(' ');
            if (index !== -1 && index < (this.info.fullname.length - 1)) {
                this.info.name = this.info.fullname.substr(0, index);
                this.info.lastName = this.info.fullname.substr(index + 1);
            } else {
                this.info.name = this.info.fullname;
            }
        }
        return '';
    }

    getIcon(index: number): string {
        const address = this.info.directions[index];
        switch (address.direction_type) {
            case 'Home':
                return 'home';
            case 'Work':
                return 'briefcase';
            default:
                return (address.favorite) ? 'star' : 'pin';
        }
    }

    removeCard(index, id) {
        this.appConfig.showLoading();
        this.rest.route(RestApi.DEL_CARDS, id).withAuth().delete().then(cards => {
            this.info.cards = this.info.cards.filter((v, i) => i !== index);
            this.appConfig.hideLoading();
            this.appConfig.getStorage('cardSelected').then(res => {
                if (res != null) {
                    if (res.id === id) {
                        this.appConfig.removeStorage('cardSelected');
                    }
                }

            });
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });
    }

    goCards() {
        this.modalCtrl.create({component: FormCardPage}).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                    this.info.cards.push(data.data);
                }
            });
        });
    }

    goAddress() {
        this.modalCtrl.create({component: AddressPage}).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                    this.info.directions.push(data.data);
                }
            });
        });
    }

    removeAddress(index, id) {
        this.appConfig.showLoading();
        this.rest.route(RestApi.DEL_ADDRESS, id).withAuth().delete().then(res => {
            this.info.directions = this.info.directions.filter((v, i) => i !== index);
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert();
        });

        if (this.appConfig.user.email) {
            this.rest.route(RestApi.PROFILE, this.appConfig.user.email).withAuth().get().then(res => {
                this.appConfig.user.directions = res.json().user.directions;
            }).catch(ex => {
                // console.error(ex);
            });
        }
    }

    sesion() {
        this.alertCtrl.create({
            header: '¡Atención!',
            subHeader: '¿Desea cerrar la sesión?',
            buttons: [{
                text: 'No',
            }, {
                text: 'Si',
                handler: () => this.oLoginProvider.logout(),
            }],
        }).then(a => a.present());
    }

    back () {
        this.appConfig.back();
    }
}
