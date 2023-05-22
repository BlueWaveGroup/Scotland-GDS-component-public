/**
 * Component Name: Gov Summary List
 * 
 * Created by: Bluewave
 * 
 **/
 import {LightningElement, api, track} from 'lwc';
 import {FlowNavigationNextEvent,FlowAttributeChangeEvent} from 'lightning/flowSupport';
 
 export default class GovChecklistSummary extends LightningElement {
    @api availableActions = []

    @api sectionName;
    @api destination;
    @api confirmationLabels =[];
    @api confirmationStatuses =[];
    @api confirmationDestinations =[];

    @api sectionLabels = [];
    @api isCompleteSection;

    sections;
    sectionFields;
 
    connectedCallback() {
        this.sections = [];
        this.sectionFields = [];
        // create the section fields from the collections
        //console.log("Creating fields")
        for(var outerIndex = 0; outerIndex < this.sectionLabels.length; outerIndex++){

            var section = {
                key: outerIndex,
                label: (outerIndex + 1) + '. ' + this.sectionLabels[outerIndex],
                sectionFields: []                
            };

            for(var index = 0; index < this.confirmationLabels.length; index++) {
                //console.log("Adding new confirmation field");
                //var sectionFieldPrefix = this.confirmationLabels[index].label.substring(0, this.confirmationLabels[index].label.indexOf('.'));
                var currentSectionField = this.confirmationLabels[index];
                console.log('Currently preocessing: ' + currentSectionField);
                var sectionFieldPrefix = currentSectionField.substring(0, currentSectionField.indexOf('.'));
                var sectionFieldPostFix = currentSectionField.substring(currentSectionField.indexOf('.') + 1);
                console.log('And the section prefix is: ' + sectionFieldPrefix);
                console.log('And the section postfix is: ' + sectionFieldPostFix);
                
                console.log('Comparison: ' + sectionFieldPrefix + ' shoudl equal ' + section.label);

                if(((outerIndex + 1) + '. ' + sectionFieldPrefix) == section.label){
                    // if prefix matches section label, add to collection, otherwise skip
                    var sectionField = {};
                    sectionField.key = index;
                    sectionField.label = sectionFieldPostFix;
                    sectionField.status = this.confirmationStatuses[index];
                    sectionField.hasLink = true;
                    if(this.confirmationStatuses[index] === "CANNOT START YET"){
                        sectionField.hasLink = false;
                    }
                    sectionField.isCompleteSection = false;
                    if(this.confirmationStatuses[index] === "COMPLETED"){
                        sectionField.isCompleteSection = true;
                    }
                    sectionField.class = this.selectStatusClass(sectionField.status);
                    sectionField.destination = this.confirmationDestinations[index];
                    //this.sectionFields.push(sectionField);
                    section.sectionFields.push(sectionField);
                } else {
                    console.log('No Match');
                }
            }

            this.sections.push(section);
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
         this.completedSection = event.target.getAttribute('data-completed');
         // tell the flow engine about the change
        const attributeChangeEventDestination = new FlowAttributeChangeEvent('destination', this.destination);
        this.dispatchEvent(attributeChangeEventDestination);

        // tell the flow engine about the change
        const attributeChangeEventCompleted = new FlowAttributeChangeEvent('isCompleteSection', this.completedSection);
        this.dispatchEvent(attributeChangeEventCompleted);

         console.log('this.completedSection' + this.completedSection);

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

     selectStatusClass(value){

        switch(value.toUpperCase()){
            case 'NOT STARTED YET':
                return 'nsy_status text_capitalize';
            case 'IN PROGRESS':
                return 'ip_status text_capitalize';
            case 'CANNOT START YET':
                return 'cns_status text_capitalize';
            case 'COMPLETED':
                return 'cmp_status text_capitalize';
        }
     }
 
 }