import {Injectable} from '@angular/core';
import {
    NotificationPermissionResponse,
    Plugins,
    PushNotification,
    PushNotificationActionPerformed,
    PushNotificationToken,
} from '@capacitor/core';
import {FCM} from '@capacitor-community/fcm';
import {ConfigGlobalProvider} from './config.global.provider';
import {HttpClient} from '@angular/common/http';

const {PushNotifications, LocalNotifications} = Plugins;

const fcm = new FCM();

@Injectable()
export class PushService {

    public isPushActive = false;
    private isListenersActive = false;
    private topics: string[] = [];
    private topicsRegistered: string[] = [];

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        private oHttpClient: HttpClient,
    ) {
    }

    sendFCM(_notification: { title?: string, body: string }, topics?: string[], data?: any) {
        let condition = '!(\'anytopics\' in topics)';

        if (topics) {
            const c = [];
            topics.forEach(topic => c.push('(\'' + topic + '\' in topics)'));
            condition = c.join('||');
        }

        this.oHttpClient.post('https://fcm.googleapis.com/fcm/send', {
            notification: {
                sound: true,
                title: _notification.title || 'Notificación',
                body: _notification.body || 'Contenido de la notificacion',
            },
            data,
            condition,
        }, {
            headers: {
                Authorization: 'Bearer ' + this.oConfigGlobalProvider.environment.firebaseConfig.serverKey,
            },
        }).subscribe(() => {
        });
    }

    register() {
        if (!this.isPushActive) {
            PushNotifications.requestPermission().then(result => {
                if (result.granted) {
                    PushNotifications.register().then(() => {
                        this.registerAllFCM();
                    });
                } else {
                    // console.log('************* ERROR IN GRANT');
                }
            });
        } else {
            this.registerAllFCM();
        }

        if (!this.isListenersActive && this.oConfigGlobalProvider.device.platform !== 'web') {
            this.isListenersActive = true;
            this.addListeners();
        }
    }

    registerFCM(topic: string) {
        if (topic && this.topicsRegistered.indexOf(topic) < 0 && this.oConfigGlobalProvider.device.platform !== 'web') {
            this.notificateLogSuccess(`FCM subscribing ` + topic);
            fcm.subscribeTo({topic})
                .then((r) => {
                    this.topicsRegistered.push(topic);
                    this.notificateLogSuccess(`FCM subscribed to topic ` + JSON.stringify(r));
                })
                .catch((err) => this.notificateLogError('FCM register: ' + err));
        } else {
            this.notificateLogError('Topic registered yet ' + topic);
        }
    }

    unregisterFCM(topic: string) {
        if (topic && this.topicsRegistered.indexOf(topic) > -1 && this.oConfigGlobalProvider.device.platform !== 'web') {
            fcm.unsubscribeFrom({topic})
                .then(() => {
                    this.topicsRegistered.splice(this.topicsRegistered.indexOf(topic), 1);
                    this.notificateLogSuccess(`FCM unsubscribed from topic`);
                })
                .catch((err) => this.notificateLogError('FCM unregister: ' + err));
        } else {
            this.notificateLogError('Topic no registered ' + topic);
        }
    }

    unregister() {
        this.topicsRegistered.forEach(topic => {
            this.unregisterFCM(topic);
        });
    }

    public notificateLogSuccess(msg: string) {
        // alert(msg);
        // console.log(msg);
    }

    public notificateLogError(msg: string) {
        // alert(msg);
        // console.log(msg);
    }

    private addListeners() {
        fcm.getToken()
            .then((r) => this.notificateLogSuccess(`FCM Token ${r.token}`))
            .catch((err) => this.notificateLogError('getToken: ' + err));

        PushNotifications.addListener('registration', (token: PushNotificationToken) => {
            this.notificateLogSuccess('PN registration: ' + JSON.stringify(token));
        });

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
            this.notificateLogSuccess('PN Push action received: ' + JSON.stringify(notification));
            this.sendLocalNotification({
                title: notification.title,
                body: notification.body,
            });
        });

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
            this.notificateLogSuccess('PN Push action performed: ' + JSON.stringify(notification));
        });

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error: any) => {
            this.notificateLogSuccess('PN Error on registration: ' + JSON.stringify(error));
        });
    }

    private registerAllFCM() {
        this.topics.forEach(topic => {
            this.registerFCM(topic);
        });
    }

    private sendLocalNotification(notification: {title?: string, body: string}) {
        LocalNotifications.requestPermission().then((granted: NotificationPermissionResponse) => {
            if (granted.granted) {
                LocalNotifications.schedule({
                    notifications: [
                        {
                            title: notification.title,
                            body: notification.body || 'Nuevo chat',
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

}
