import {Component, OnInit, ViewChild} from '@angular/core';
import {CameraPhoto, CameraResultType, CameraSource, NotificationPermissionResponse, Plugins} from '@capacitor/core';
import RestService, {RestApi} from '../../providers/rest-service';
import {GlobalConfigProvider} from '../../providers/global-config';
import {ActivatedRoute} from '@angular/router';
import {IonContent} from '@ionic/angular';
import * as firebase from 'firebase';
import {PushService} from '../../providers/push.service';
import DataSnapshot = firebase.database.DataSnapshot;

const {LocalNotifications} = Plugins;

@Component({
    selector: 'page-chat',
    styleUrls: ['chat.scss'],
    templateUrl: 'chat.html',
})
export class ChatPage implements OnInit {

    counter = 0;
    data: any = {
        messages: [],
    };
    loadFirst = true;
    text: string;
    ref: any;
    domiciliary: any;
    order: any;
    @ViewChild(IonContent) content: IonContent;

    constructor(
        private rest: RestService,
        public appConfig: GlobalConfigProvider,
        private route: ActivatedRoute,
        public oPushService: PushService,
    ) {
        const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
        this.order = data.order;
        this.domiciliary = this.order.domiciliary;
    }

    ngOnInit() {
        this.appConfig.showLoading();
        this.loadChats();
        this.updateScroll();
        this.subcribeChat();
    }

    subcribeChat() {
        if (!this.ref) {
            this.ref = firebase.database().ref('/chat/orders/' + this.order.uuid);
            this.ref.on('value', (dataSnapshot: DataSnapshot) => {
                dataSnapshot.forEach((orderSnapshot: DataSnapshot) => {
                    const chatVal = orderSnapshot.val();

                    if (chatVal) {
                        if (chatVal.chat_message) {
                            const chat = chatVal.chat_message;
                            const dataMsg: any = {
                                uuid: chat.uuid,
                                message: chat.message,
                                image: chat.image,
                                createdAt: chatVal.created_at,
                                updatedAt: chatVal.created_at,
                            };

                            if (chat.user !== this.appConfig.user.uuid) {
                                if (!this.loadFirst) {
                                    LocalNotifications.requestPermission().then((granted: NotificationPermissionResponse) => {
                                        if (granted.granted) {
                                            LocalNotifications.schedule({
                                                notifications: [
                                                    {
                                                        title: 'Chat',
                                                        body: 'Nuevo chat',
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
                                dataMsg.user = this.domiciliary;
                            } else {
                                dataMsg.user = this.appConfig.user;
                            }

                            this.addMessage(dataMsg);
                        }
                    }

                    this.updateScroll();
                });

                if (this.loadFirst) {
                    this.appConfig.hideLoading();
                    this.loadFirst = false;
                }
            }, error => {
                this.appConfig.hideLoading();
                // this.nav.pop();
            });
            this.appConfig.setChatRef(this.ref);
        }
    }

    updateScroll() {
        setTimeout(() => {
            this.content.scrollToBottom();
        }, 400);
    }

    addMessage(chat) {
        let count = 0;
        for (const message of this.data.messages) {
            if (chat.uuid === message.uuid) {
                return;
            }
            if (message.uuid == null) {
                if (message.message === chat.message) {
                    this.data.messages[count].uuid = message.uuid;
                    return;
                }
            }
            count++;
        }
        this.data.messages.push({
            uuid: chat.uuid,
            message: chat.message,
            image: chat.image,
            user: chat.user,
            createdAt: chat.createdAt,
            updatedAt: chat.createdAt,
        });
    }

    loadChats() {
        this.appConfig.showLoading();
        this.rest.route(RestApi.CHAT, this.order.uuid).withAuth().get().then(res => {
            this.data = res.json();
            this.updateScroll();
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showAlert('Error', 'Revise su conexión a internet');
        });
    }

    send() {
        if (this.text) {
            const txt = this.text.trim();
            if (txt.length > 0) {
                if (!this.data.messages) {
                    this.data.messages = [];
                }
                this.counter = this.counter + 1;
                const _number = this.counter;
                this.data.messages.push({
                    uuid: null,
                    user: this.appConfig.user,
                    message: txt,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    number: _number,
                });
                this.rest.route(RestApi.CHAT_SEND, this.order.uuid).withAuth().post({body: {message: txt}})
                    .then((res: any) => {
                        res = res.json();
                        const message = res.message;
                        this.oPushService.sendFCM({
                            title: 'Nuevo Chat',
                            body: message.message,
                        }, ['domiciliary_' + this.order.domiciliary._id]);
                    }).catch(ex => {
                    this.appConfig.showAlert('Error', 'No se ha podido enviar el mensaje');
                    this.deleteNulled(_number);
                });
                this.text = '';
                this.toTheBottom(100);
            }
        }
    }

    deleteNulled(_number: number) {
        if (_number !== 0) {
            this.data.messages = this.data.messages.filter(chat => chat.number !== _number);
        }
    }

    toTheBottom(time: number = 0) {
        if (time > 0) {
            setTimeout(() => {
                const scrollChat = document.querySelector('page-chat > ion-content > div.scroll-content');
                // scrollChat.scrollTo(0, scrollChat.scrollHeight + 70);
            }, time);
        } else {
            const scrollChat = document.querySelector('page-chat > ion-content > div.scroll-content');
            // scrollChat.scrollTo(0, scrollChat.scrollHeight + 70);
        }
    }

    scroll() {
        const scrollChat = document.querySelector('page-chat > ion-content > div.scroll-content');
        scrollChat.scrollTo(0, 200);
    }

    selectFile() {
        Plugins.Camera.getPhoto({
            quality: 30,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Photos,
        }).then((cameraPhoto: CameraPhoto) => {
            this.rest.route(RestApi.CHAT_SEND, this.order.uuid).withAuth().post({body: {image: cameraPhoto.base64String}})
                .then(res => {
                }).catch(ex => {
                this.appConfig.showAlert('Error', 'No se ha podido enviar el mensaje');
            });
        }); // .catch(console.log);
    }
}
