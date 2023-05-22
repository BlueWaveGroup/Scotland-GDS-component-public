/**
 * Component Name: Gov CSS Provider
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
 import { LightningElement } from 'lwc';
 import { loadStyle } from 'lightning/platformResourceLoader';
 import govCssStyle from '@salesforce/resourceUrl/govMain';
 
 let cssStylesLoaded = false;
 
 export default class GovCSSProvider extends LightningElement {
 
     constructor() {
         super();
         if (cssStylesLoaded === true) {
             return;
         }
         cssStylesLoaded = true;
         loadStyle(this, govCssStyle)
         .then(() => console.log('CSS File loaded.'))
         .catch(console.log("Error "));
     }
 
 }