// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    debug: true,
    deviceId: '1515',
    uri: 'http://togo.my-deliveryapp.com:1337',
    jwt: 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InBob25lIjpbeyJwaG9uZSI6IjY1MzY1OTA1IiwidXNlciI6IjUxNzNkZTIyLTM4NzYtNGUzMi05ZTQ1LTI0ZmMyNDVhM2ZkZSIsImlkIjoiNWViMmVjMjQwMmYwY2E1ZTEyZWQ1MmVmIn1dLCJkaXJlY3Rpb25zIjpbeyJsYXRpdHVkZSI6IjguOTkwMjU1NSIsImxvbmdpdHVkZSI6Ii03OS41MDIwODkwOTk5OTk5OSIsIm5hbWUiOiJQSCBCYXkgVmlldyAtIFNhbiBmcmFuY2lzY28sIFBhbmFtw6EiLCJkaXJlY3Rpb25fdHlwZSI6IkhvbWUiLCJmYXZvcml0ZSI6ZmFsc2UsInVzZXIiOiI1MTczZGUyMi0zODc2LTRlMzItOWU0NS0yNGZjMjQ1YTNmZGUiLCJ1dWlkIjoiZjYxMzM1YzMtM2Q4NS00NzZlLWI0ZTktNGQxMmI4ZTdkZmY1IiwiY3JlYXRlZEF0IjoiMjAyMC0wNS0yMVQxNjo1NDowNy4zMDZaIiwidXBkYXRlZEF0IjoiMjAyMC0wNS0yM1QyMTowNDo1OS40NDhaIiwiaWQiOiI1ZWM2YjIyZjIxMmI3ZTE2YzM0NWQ4N2YifSx7ImxhdGl0dWRlIjoiOS4wMTEzMDYyIiwibG9uZ2l0dWRlIjoiLTc5LjQ3MjIzNDIiLCJuYW1lIjoiUEggUGFycXVlIGRlbCBNYXIsIFBhbmFtw6EiLCJkaXJlY3Rpb25fdHlwZSI6IkhvbWUiLCJmYXZvcml0ZSI6dHJ1ZSwidXNlciI6IjUxNzNkZTIyLTM4NzYtNGUzMi05ZTQ1LTI0ZmMyNDVhM2ZkZSIsInV1aWQiOiI0YzgwMWNiMS0wNzVlLTRjNWItYTQwMS0zNDE0YTgyZWM1ZjUiLCJjcmVhdGVkQXQiOiIyMDIwLTA1LTIxVDE2OjU0OjQzLjA2OFoiLCJ1cGRhdGVkQXQiOiIyMDIwLTA1LTIzVDIxOjA0OjU5LjQ2OVoiLCJpZCI6IjVlYzZiMjUzMjEyYjdlMTZjMzQ1ZDg4MCJ9XSwiY2FyZHMiOltdLCJzZXJ2aWNlcyI6W10sIm5hbWUiOiJDTElFTlQiLCJsYXN0TmFtZSI6IkJBU0UiLCJlbWFpbCI6ImRhbmlAY3JvbmFwaXMuY29tIiwiZGV2aWNlSWQiOiIxNTE1IiwidXVpZCI6IjUxNzNkZTIyLTM4NzYtNGUzMi05ZTQ1LTI0ZmMyNDVhM2ZkZSIsInVzZXJUeXBlIjoiY2xpZW50IiwiYWN0aXZlZCI6dHJ1ZSwiZGVidHNfdG9fcGF5IjowLCJhZGRpdGlvbmFsQ29zdCI6MCwiY3JlYXRlZEF0IjoiMjAyMC0wNS0yMFQxOToyNDozNy40NzdaIiwidXBkYXRlZEF0IjoiMjAyMC0wNS0yMFQxOToyNDozNy41MDRaIiwiaWQiOiI1ZWM1ODNmNWUwODUxNzBjYjgxMDg2OTQifSwiaWF0IjoxNTkwNDM5NzA0LCJleHAiOjE1OTA2MTI1MDR9.w-y2hifUcRyfc0MLzyGgzlePNX1qQULMnF_ySEixA6k',
    nameApp: 'Togo',
    login: {
        google: true,
        facebook: true,
        apple: false,
        form: true,
        no: true,
        test: true,
    },
    loginTest: {
        phone: '65365905',
        password: '1',
    },
    configStore: {
        autocategory: false,
        searchBar: true,
        circleCategories: true,
        compactStores: true,
        multiStore: false,
        category: 'f217d57b-bb0e-44a6-bccf-bb8dc1eeea0d',
        store: 'a7445517-a28f-42c0-b9e6-1bbe0dcd71ce',
        supermercados: [],
        categorias: [],
        cash: true,
        tdc: true,
        pos: false,
        yappis: [],
        ach: [{
            account: 'Cuenta X',
            number: 'Número cuenta: X',
            person: 'X',
        }],
    },
    googleConfig: {
        webClientId: '1037458800535-s0aiilepq3j5u6iorei4qk18bfkb3m7c.apps.googleusercontent.com',
        offline: true,
    },
    firebaseConfig: {
        apiKey: 'AIzaSyC-6310db3Sss_jHBGuaGCY2aS6zwxX6oI',
        authDomain: 'togo-2aa50.firebaseapp.com',
        databaseURL: 'https://togo-2aa50.firebaseio.com',
        projectId: 'togo-2aa50',
        storageBucket: 'togo-2aa50.appspot.com',
        messagingSenderId: '1037458800535',
        appId: '1:1037458800535:web:f4e4449dd91c8aa771ced2',
        serverKey: 'AAAA8Y1c_5c:APA91bHKriPjuK5iexhllChk3TvctIPrNxpcBKLm1RPX3dy81D9sb0zhzMH9lsMTsrnoJbBMcMXcrlAz49-YIEVoaRpLpctqIid6Kfwco2eCgKMIrhMTk9KH7cOy-K0ApH_cIDEheWRd',
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
