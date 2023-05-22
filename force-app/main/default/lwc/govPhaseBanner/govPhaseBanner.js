/**
 * Component Name: Gov UK Phase Banner
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
 import {LightningElement,api} from 'lwc';

 export default class PhaseBanner extends LightningElement {
     @api phaseText;
     @api bodyText;
 }