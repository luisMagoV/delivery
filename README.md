## How install
### With the Ionic CLI:

MINIMUM REQUIREMENTS:

```bash
SO: LINUX/MAC/WINDOWS
ANDROID SDK: 28
NODE: 12+
NPM: 6.4+
CORDOVA: >= 8.0.0 || <= 8.1.1
@IONIC/CLI: 5+
@ANGULAR/CLI: 9.1+
```

Used when using the `ionic start` command below:

```bash
$ sudo npm install -g @ionic/cli @angular/cli cordova@8.1.1 phonegap native-run cordova-res
```

Then, change id facebook and google by command:
```bash
$ # client_id from bundle_id google.services.json
$ ionic cordova plugin add cordova-plugin-googleplus --save --variable REVERSED_CLIENT_ID=com.googleusercontent.apps.999999999999-9A9A9A99AAA99AA9A9A9A9A9A99AA9
$ ionic cordova plugin add cordova-plugin-facebook4 --variable APP_ID="999999999999999" --variable APP_NAME="NAME"
```

Add files `google-services.json` and `GoogleService-Info.plist` as yours examples

Modify `src/enviroments/environment.ts`

```bash
// client_id from oauth_client google-services.json
export const environment = {
  production: false,
  debug: false,
  googleLogin: true,
  facebookLogin: true,
  FormLogin: true,
  deviceId: '1515',
  uri: 'http://localhost:8080',
  nameApp: 'NAME_APP',
  loginTest: {
    phone: '123456',
    password: '1',
  },
  googleConfig: {
    webClientId: '999999999999-9A9A9A99AAA99AA9A9A9A9A9A99AA9.apps.googleusercontent.com',
    offline: false,
  },
  firebaseConfig: {
    apiKey: 'AIzaSyAcAoXa1dW4CiVsA3ExXm-k86mnR4kPyh4',
    authDomain: 'ionic.app.firebaseapp.com',
    databaseURL: 'https://ionic.app.firebaseio.com',
    projectId: 'ionic.app',
    storageBucket: 'ionic.app.appspot.com',
    messagingSenderId: '99999999999999',
    appId: '1:999999999999:android:999999A9999AA9AA9A9A9A9',
  },
};
```

Then, put icon.png (1024x1024) and splash.png (2732x2732) and change name app in config.xml and permissions text, to install all plugins:

```bash
$ sudo npm install
$ sudo ionic cordova resources
$ sudo ionic cordova prepare android
```

Then, to run it:

```bash
$ ionic cordova run android --device --debug
```

