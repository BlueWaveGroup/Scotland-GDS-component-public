/**
 * Component Name: Gov Summary List
 * 
 * Created by: Bluewave
 * 
 **/
 import {LightningElement, api, track} from 'lwc';
 import {FlowNavigationNextEvent} from 'lightning/flowSupport';
 
 export default class GovSummary extends LightningElement {
     @api availableActions = []
 
     @api title;
     @api sectionName;
     @api instructionsHTML;
     @api destination;
     @api confirmationLabels =[];
     @api confirmationValues =[];
     @api confirmationDestinations =[];
 
     sectionFields;
 
     connectedCallback() {
         this.sectionFields = [];
         // create the section fields from the collections
         //console.log("Creating fields")
         for(var index = 0; index < this.confirmationLabels.length; index++) {
             //console.log("Adding new confirmation field");
             var sectionField = {};
             sectionField.key = index;
             sectionField.label = this.confirmationLabels[index];
             sectionField.value = this.confirmationValues[index]; 
             if(sectionField.value instanceof Date){
                console.log('HERE');
             }

             sectionField.destination = this.confirmationDestinations[index];
             if(sectionField.value !== '' && sectionField.value !== null){                
                this.sectionFields.push(sectionField);
             }
             sectionField.changeLabel = 'Change ' + sectionField.label;
         }
     }
 
     renderedCallback() {
         //insert the instructions HTML
         if(this.instructionsHTML) {
             //console.log(`setting html instructions`);
             const htmlElement = this.template.querySelector(".html-element");
             if(htmlElement) {
                 htmlElement.innerHTML = this.instructionsHTML;
                 //console.log(`done it`);
             }
         }
     }
 
     handleChange(event) {
 
         this.destination = event.target.getAttribute('data-destination');

         //this.dispatchEvent(new FlowAttributeChangeEvent('Destination', event.target.getAttribute('data-destination')));
 
         console.log(`processing handleChange event for ${this.destination}`);
 
         if (this.availableActions.find(action => action === 'NEXT')) {
             //console.log(`sending next event to flow engine.`);
             const nextNavigationEvent = new FlowNavigationNextEvent();
             this.dispatchEvent(nextNavigationEvent);
         }
     }
 
     handleSend(event) {
         // next flow
         this.destination = "Default_Screen";
         const nextNavigationEvent = new FlowNavigationNextEvent();
         this.dispatchEvent(nextNavigationEvent);
     }
 
 }