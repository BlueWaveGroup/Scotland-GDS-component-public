/**
 * Component Name: Gov UK Panel
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/

import { LightningElement, api } from 'lwc';

export default class GovNotificationPanel extends LightningElement {
    
        @api titleText;
        @api bodyText;
    
        connectedCallback() {
        }
    
    }