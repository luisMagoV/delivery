import {Component} from '@angular/core';

/**
 * Generated class for the PayDebtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'ngx-content-loader-200',
    template: `
        <svg role="img" width="400" height="200" aria-labelledby="loading-aria" viewBox="0 0 400 200"
             preserveAspectRatio="none">
            <title id="loading-aria">Loading...</title>
            <rect x="0" y="0" width="100%" height="100%" clip-path="url(#clip-path)" style='fill: url("#fill");'></rect>
            <defs>
                <clipPath id="clip-path">
                    <ng-content></ng-content>
                </clipPath>
                <linearGradient id="fill">
                    <stop offset="0.599964" stop-color="#bdbdbd" stop-opacity="1">
                        <animate attributeName="offset" values="-2; -2; 1" keyTimes="0; 0.25; 1" dur="2s"
                                 repeatCount="indefinite"></animate>
                    </stop>
                    <stop offset="1.59996" stop-color="#ecebeb" stop-opacity="1">
                        <animate attributeName="offset" values="-1; -1; 2" keyTimes="0; 0.25; 1" dur="2s"
                                 repeatCount="indefinite"></animate>
                    </stop>
                    <stop offset="2.59996" stop-color="#bdbdbd" stop-opacity="1">
                        <animate attributeName="offset" values="0; 0; 3" keyTimes="0; 0.25; 1" dur="2s"
                                 repeatCount="indefinite"></animate>
                    </stop>
                </linearGradient>
            </defs>
        </svg>
    `,
})
export class ContentLoader200Page {

}
