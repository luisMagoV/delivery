import {Injectable} from '@angular/core';
import {ModalController, Platform} from '@ionic/angular';
import {Plugins} from '@capacitor/core';
import {GlobalConfigProvider} from './global-config';
import {ConfigGlobalProvider} from './config.global.provider';
import RestService, {RestApi} from './rest-service';
import {Facebook, FacebookLoginResponse} from '@ionic-native/facebook/ngx';
import {GooglePlus} from '@ionic-native/google-plus/ngx';
import * as firebase from 'firebase';
import {Router} from '@angular/router';
import {PushService} from './push.service';
import UserCredential = firebase.auth.UserCredential;

const {SignInWithApple} = Plugins;

@Injectable()
export class LoginProvider {

    constructor(
        private platform: Platform,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private rest: RestService,
        private modalController: ModalController,
        private oFacebook: Facebook,
        private oGooglePlus: GooglePlus,
        private router: Router,
        public oPushService: PushService,
    ) {
    }

    googleLogin() {
        this.oConfigGlobalProvider.presentLoading();
        /* */ // with plugin
        this.oGooglePlus.login(this.appConfig.environment.googleConfig).then(async (response) => {

            this.appConfig.setStorage('tokenGoogle', response.accessToken);
            const credentials = response.accessToken ?
                firebase.auth.GoogleAuthProvider.credential(response.idToken, response.accessToken) :
                firebase.auth.GoogleAuthProvider.credential(response.idToken);

            await this.firebaseAuth(credentials, RestApi.GOOGLEPLUS, response.accessToken, response);
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({message: JSON.stringify(ex), title: 'ERROR GOOGLE LOGIN'});
        });
        /* * / // with provider firebase
        const provider = new firebase.auth.OAuthProvider('google.com');
        firebase.auth().signInWithPopup(provider).then((response: UserCredential) => {
            response.user.getIdToken().then((token: string) => {
                this.firebaseAuth(response.credential, RestApi.GOOGLEPLUS, token);
            });
        });
        /* */
    }

    facebookLogin() {
        this.oConfigGlobalProvider.presentLoading();
        /* */ // with plugin
        this.oFacebook.login(['public_profile', 'email']).then((response: FacebookLoginResponse) => {
            this.appConfig.setStorage('tokenFacebook', response.authResponse.accessToken);
            const credentials = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);

            this.firebaseAuth(credentials, RestApi.FACEBOOK, response.authResponse.accessToken, response);
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({message: JSON.stringify(ex), title: 'ERROR FACEBOOK LOGIN'});
        });
        /* * / // with provider firebase
        const provider = new firebase.auth.OAuthProvider('facebook.com');
        provider.addScope('profile');
        provider.addScope('email');
        firebase.auth().signInWithPopup(provider).then((response: UserCredential) => {
            response.user.getIdToken().then((token: string) => {
                this.firebaseAuth(response.credential, RestApi.FACEBOOK, token);
            });
        });
        /* */
    }

    appleLogin() {
        this.oConfigGlobalProvider.presentLoading();
        /* * / // with plugin
        SignInWithApple.signin({
            requestedScopes: [
                ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
                ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail,
            ]
        }).then((appleCredential: AppleSignInResponse) => {
            const credentials = new firebase.auth.OAuthProvider('apple.com').credential(appleCredential.identityToken);

            this.firebaseAuth(credentials, RestApi.APPLE, appleCredential.identityToken);
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({message: JSON.stringify(ex), title: 'ERROR APPLE LOGIN'});
        });
        /* */ // with provider firebase
        if (this.oConfigGlobalProvider.device.platform === 'ios') {
            SignInWithApple.Authorize().then((res) => {
                if (res.response && res.response.identityToken) {
                    this.appConfig.setStorage('tokenFacebook', res.response.identityToken);
                    const credentials = new firebase.auth.OAuthProvider('apple.com').credential({
                        idToken: unescape(encodeURIComponent(res.response.identityToken)),
                    });

                    this.firebaseAuth(credentials, RestApi.APPLE, res.response.identityToken, res.response);
                } else {
                    this.oConfigGlobalProvider.showAlert('ERROR LOGIN APPLE', JSON.stringify(res));
                }
            }).catch(res => {
                this.oConfigGlobalProvider.showAlert('ERROR LOGIN APPLE', JSON.stringify(res));
            });
        } else {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            firebase.auth().signInWithPopup(provider).then((response: UserCredential) => {
                response.user.getIdToken().then((token) => {
                    this.firebaseAuth(response.credential, RestApi.APPLE, token);
                });
            }).catch(ex => {
                this.oConfigGlobalProvider.showErrorAlert({message: JSON.stringify(ex), title: 'ERROR APPLE LOGIN'});
            });
        }
        /* */
    }

    loginCustom(_body) {
        this.oConfigGlobalProvider.presentLoading();
        this.rest.login({
            body: _body,
        }).then((login: any) => {
            login = login.json();
            this.appConfig.token = login.token;
            this.appConfig.uid = login.user.uuid;
            this.oConfigGlobalProvider.user = login;
            this.rest.setToken(login.token);

            this.appConfig.setStorage('token', login.token);
            this.appConfig.setStorage('uid', login.user.uuid);

            this.user(this.appConfig.uid);
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({message: ex, title: 'Login fallido'});
        });
    }

    loadAuth() {
        this.appConfig.getStorage('token').then((token) => {
            this.appConfig.getStorage('uid').then(uid => {
                if (uid && token) {
                    this.appConfig.token = token;
                    this.appConfig.uid = uid;
                    this.oConfigGlobalProvider.presentLoading();
                    this.user(uid);
                }
            }).catch(ex => {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: JSON.stringify(ex),
                    title: 'ERROR UID GET',
                });
            });
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: JSON.stringify(ex),
                title: 'ERROR TOKEN GET',
            });
        });
    }

    logout() {
        this.rest.setToken('');
        this.appConfig.resetConfig();
        this.oConfigGlobalProvider.user = null;
        this.appConfig.clearStorage();
        this.router.navigate(['/'], {replaceUrl: true});
        this.oPushService.unregister();
    }

    registerFCM() {
        this.oPushService.registerFCM('client_all');
        this.oPushService.registerFCM(this.oConfigGlobalProvider.user.uuid || this.oConfigGlobalProvider.user.user.uuid);
    }

    private firebaseAuth(credentials: any, api: any, token: any, args?: any) {
        firebase.auth().signInWithCredential(credentials).then((userCredential: UserCredential) => {
            if (userCredential.user.email) {
                args = args || {};
                args.additionalUserInfo = userCredential.additionalUserInfo;
                args.UserInfo = userCredential.user;

                this.rest.route(RestApi.EMAIL_VALID, userCredential.user.email).get().then((email: any) => {
                    this.rrss(api, token, email.json().status === 'ok', args);
                }).catch(ex => {
                    this.appConfig.hideLoading();
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR EMAIL INVALID LOGIN',
                    });
                });
            } else {
                this.rrss(api, token, true);
            }
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({message: JSON.stringify(ex), title: 'ERROR FIREBASE LOGIN'});
        });
    }

    private rrss(restApi: RestApi, token, isNewAccount, args?: any) {
        const body = args || {};
        body.access_token = token;

        this.rest.route(restApi).addDeviceId().post({
            body,
        }).then((rrss: any) => {
            this.oConfigGlobalProvider.dismissLoading();
            rrss = rrss.json();

            this.appConfig.user = rrss.user;
            this.appConfig.token = rrss.token;
            this.appConfig.uid = rrss.user.uuid;
            this.rest.setToken(rrss.token);

            this.appConfig.setStorage('token', rrss.token);
            this.appConfig.setStorage('user', rrss.user);
            this.appConfig.setStorage('uid', rrss.user.uuid);

            if (isNewAccount) {
                this.router.navigate(['/tabs/create-password'], {
                    queryParams: {
                        data: JSON.stringify({
                            firstName: rrss.user.firstName,
                            lastName: rrss.user.lastName,
                            phone: rrss.user.phone,
                        }),
                    },
                });
            } else {
                this.user(rrss.user.uuid);
            }
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({message: ex, title: 'ERROR RRSS LOGIN'});

            this.appConfig.removeStorage('token');
            this.appConfig.removeStorage('uid');
            this.appConfig.removeStorage('user');
        });
    }

    private user(uid: string) {
        this.rest.route(RestApi.USERS, uid).withAuth().get().then((user: any) => {
            user = user.json();
            this.oConfigGlobalProvider.user = user;
            this.appConfig.token = user.token;
            this.appConfig.uid = user.user.uuid;
            this.appConfig.user = user.user;
            this.rest.setToken(user.token);

            this.appConfig.setStorage('token', user.token); // renueva token
            this.appConfig.setStorage('uid', user.user.uuid);
            this.appConfig.setStorage('user', user.user);
            this.registerFCM();
            this.loadAddress();
            this.oConfigGlobalProvider.login.emit(user);

            this.modalController.getTop().then((modal) => {
                modal?.dismiss();
            });

            this.rest.route(RestApi.GET_RATING, user.user.uuid).withAuth().get().then((resAverage: any) => {
                resAverage = resAverage.json();
                this.appConfig.setStorage('average', resAverage.average);
            }).catch(ex => {
                this.oConfigGlobalProvider.dismissLoading();
                /* * /
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR EN EL ROUTE LOAD_AUTH GET_RATING',
                });
                /* */
            });
            this.oConfigGlobalProvider.dismissLoading();
        }).catch(ex => {
            const error = JSON.parse(ex.text());
            if (error.message === 'jwt expired')
                this.oConfigGlobalProvider.dismissLoading();
            else {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR USERS LOGIN',
                });
            }
        });
    }

    private loadAddress() {
        this.appConfig.hasFavorite = false;

        if (this.appConfig?.user?.directions) {
            this.appConfig?.user?.directions.forEach((direction: any) => {
                if (direction.favorite) {
                    this.appConfig.addressSelected = direction;
                    this.appConfig.hasFavorite = true;
                    this.appConfig.setFavorite.emit(true);
                }
            });
        }
    }

}
