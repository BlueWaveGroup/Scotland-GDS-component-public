/**
 * Component Name: Gov Notification Banner
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
import {LightningElement,api} from 'lwc';

export default class GovNotificationBanner extends LightningElement {
    @api bodyText;

    showBanner = true;

    hideBanner(){
        this.showBanner = false;
    }
}