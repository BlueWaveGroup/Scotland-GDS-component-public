/**
 * Component Name: Gov Start Button
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
 import {LightningElement, api} from 'lwc';
 import { NavigationMixin } from 'lightning/navigation';
 
 export default class GovStartButton extends NavigationMixin(LightningElement) {
     @api label;
     @api link;
 
     handleClick(event) {
         this[NavigationMixin.Navigate]({
             type: 'standard__webPage',
             attributes: {
                 name: this.link
             },
             state: {
             }
         });
     }
 }