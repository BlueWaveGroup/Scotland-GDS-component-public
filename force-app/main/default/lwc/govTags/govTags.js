/**
 * Component Name: Gov Tag
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
 import { LightningElement,api,track } from 'lwc';

 export default class GovTag extends LightningElement {
 
     @api tagText = '';
     @api tagTextColour = 'Default';
     @api tagTextDescription;
 
     @track tagClass = "ds_tag";
  
     connectedCallback(){
       
             if(this.tagTextColour.toUpperCase() === 'GREY') {
                 this.tagClass += " ds_tag__grey";
             } else if(this.tagTextColour.toUpperCase() === 'GREEN') {
                 this.tagClass += " ds_tag__green";
             } else if(this.tagTextColour.toUpperCase() === 'TURQUOISE') {
                 this.tagClass += " ds_tag__turquoise";
             } else if(this.tagTextColour.toUpperCase() === 'BLUE'){
                 this.tagClass += " ds_tag__blue";
             } else if(this.tagTextColour.toUpperCase() === 'PURPLE') {
                 this.tagClass += " ds_tag__purple";
             } else if(this.tagTextColour.toUpperCase() === 'PINK') {
                 this.tagClass += " ds_tag__pink";
             } else if(this.tagTextColour.toUpperCase() === 'RED'){
                 this.tagClass += " ds_tag__red";
             } else if(this.tagTextColour.toUpperCase() === 'ORANGE') {
                 this.tagClass += " ds_tag__orange";
             } else if(this.tagTextColour.toUpperCase() === 'YELLOW'){
                 this.tagClass += " ds_tag__yellow";
             } else {
                 this.tagClass += "";
             }
     }
 }