/**
 * Component Name: Gov Checkbox
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
 import {LightningElement, api, wire, track} from 'lwc';
 import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
 import { MessageContext, publish, subscribe, unsubscribe } from 'lightning/messageService';
 import REGISTER_MC from '@salesforce/messageChannel/registrationMessage__c';
 import VALIDATION_MC from '@salesforce/messageChannel/validateMessage__c';
 import VALIDATION_STATE_MC from '@salesforce/messageChannel/validationStateMessage__c';
 import getPicklistValuesByObjectField from '@salesforce/apex/GovComponentHelper.getPicklistValuesByObjectField';
 import VISIBILITY_MC from '@salesforce/messageChannel/visibilityMessage__c';

 export default class GovCheckboxes extends LightningElement {
     // flow inputs and outputs
     @api fieldId = "checkboxField";
     @api errorMessage;
     @api headinglabel;
     @api headinghint;
     @api required = false;
     @api labels ;
     //@api names ;
     @api booleanValues;
     @api outputValueCollection = [];
     @api outputValueBoolean;
     @api outputValue;
     @api picklistField;
 
     @api headingFontSize = '';
     @api smallerCheckboxes;
     @api visibilityValue;
     @api visibilitySender;
     @api visibilityValueReceiver;
 
     @track checkboxArray = [];
     @track checked = false;
     @track showInfo = false;
     @track checkboxArrayInit = [];
     @track defaultValuesList;
     @track isListeningMode = false;
     @track isVisible;
 
     // other attributes
     initialised;
     hasErrors;
 
     // messaging attributes
     @wire(MessageContext) messageContext;
     validateSubscription;
 
 
     get checkboxClass() {
         let checkboxClass = "ds_checkbox";
         checkboxClass = (this.smallerCheckboxes) ? checkboxClass + " ds_checkbox--small" : checkboxClass;
         return checkboxClass;
     }
 
     connectedCallback() {
        console.log('this is hitting');
        console.log('this.outputValueBoolean' + this.outputValueBoolean);
        this.showInfo = false;
        let defaultValuesBooleanList = [];
         
         this.defaultValuesList = this.outputValue ? this.outputValue.split(';') : [];
         console.log('defaultValuesList1 ' + this.defaultValuesList.length);
         
         if(this.picklistField !== '' && this.picklistField !== undefined && this.picklistField !== null) {
             // get picklist field values
             getPicklistValuesByObjectField({
                 strSObjectFieldName: this.picklistField
             })
                 .then(result => {
                     //this.checkboxArray = [];
                     for(let i=0; i<result.length; i++) {
                         let checkboxObj = {
                             checkboxLabel : '',
                             checkboxValue : false
                             };   
                         checkboxObj.checkboxLabel = result[i];    
                         

                         this.checkboxArrayInit.push(checkboxObj);   
                         this.checkboxArray.push(checkboxObj); 
                         console.log('this box in adding' + this.checkboxArray);
                        
                    }
                    this.sortOutputValueBoolean();
                 })
                 .catch(error => {
                     console.error(`Select:connectedCallback - could not get checkbox picklist values due to ${error.message}`);
                 })
         } else {
             //user provided values
             console.log('not here');
             let labelsList = this.labels ? this.labels.split(',') : [];
             for(let i=0; i<labelsList.length;i++){
                 let checkboxObj = {
                     checkboxLabel : '',
                     checkboxValue : false
                     };
                 checkboxObj.checkboxLabel = labelsList[i];
                 this.checkboxArrayInit.push(checkboxObj);
                 this.checkboxArray.push(checkboxObj); 
             }
             this.sortOutputValueBoolean();
         }
         console.log('selected values are'+ this.checkboxArray);
 
         let checkedCount = 0;
         let outputString = '';
         
        this.isVisible = true;        
        console.log('visibilitySender' + this.visibilitySender);
                console.log('visibilityValueReceiver' + this.visibilityValueReceiver);
               // console.log('isVisible@@@@' + this.isVisible);
        //checking if it is in listening mode - as receiver
        if(this.visibilitySender !== '' && this.visibilitySender !== undefined){
            if(this.visibilityValueReceiver !== '' && this.visibilityValueReceiver !== undefined){
                this.isListeningMode = true;
                this.isVisible = false;
                console.log('isVisible@@@@' + this.isVisible);
                console.log('listening mode' + this.isListeningMode);
                console.log('isVisible@@@@' + this.isVisible);
            }
        }

        console.log('checkbo' + this.checkboxArray);
        

         if(checkedCount>0){
             this.checked = true;
             this.dispatchCheckboxEvent();
             
         }else{
             this.checked = false;
         }
 
         // subscribe to the message channels
         this.subscribeMCs();
 
         // publish the registration message after 0.1 sec to give other components time to initialise
         setTimeout(() => {
             publish(this.messageContext, REGISTER_MC, {componentId:this.fieldId});
         }, 100);

         //as sender
         setTimeout(() => {
            console.log('in selecte value');
            this.checkVisibility();},200);
     }
 
     disconnectedCallback() {
         this.unsubscribeMCs();
     }
 
     renderedCallback() {
         if(this.initialised) {
             return;
         }
         const labelText = this.template.querySelectorAll(".label-text").forEach(element => {
             element.innerHTML = this.label;
         })
         this.initialised = true;
     }
 

     checkVisibility(){
        //as sender
        var visibleMessage = false;

        
        if(this.outputValue !== undefined && this.outputValue.length > 0){
            const outputValueArray = this.outputValue.split(';');
            for(var i=0; i<outputValueArray.length; i++){
                if(outputValueArray[i] === this.visibilityValue){
                    visibleMessage = true;                    
                }
            } 
            if(visibleMessage == true){
                //we dont want to push all selected checkboes
                //only publishing when the value that would trigger visiblity on the receiver
                //IMPROVEMTN all values to be sent- wold require a change to text input and text area             
                publish(this.messageContext, VISIBILITY_MC, {
                    componentValue: this.visibilityValue,
                    componentId: this.fieldId
                });
            }else{
                //if not selected, we push a custom value
                var noVisiblityValue = 'NOT' + this.visibilityValue + 'SELECTED';
                publish(this.messageContext, VISIBILITY_MC, {
                    componentValue: noVisiblityValue,
                    componentId: this.fieldId
                });
            }
                  
        }
    }

     sortOutputValueBoolean(){
        let checkedCount = 0;
        let outputString = '';
        console.log('defaultValuesList2 ' + this.defaultValuesList.length);
         console.log('this.checkboxArray.length ' + this.checkboxArray.length);
        if (this.defaultValuesList.length > 0) {  
            //resetting
            this.outputValue = [];  
            this.outputValueBoolean =[];

            for(var i=0; i<this.checkboxArray.length; i++){                                                       
                for(let j=0; j<this.defaultValuesList.length;j++){           
                    console.log('checking value' + this.checkboxArray[i].checkboxLabel);   
                    console.log('defaultValuesList' + this.defaultValuesList[j]);          
                    if(this.checkboxArray[i].checkboxLabel == this.defaultValuesList[j]){
                        console.log('defaultValuesList true@@');  
                        this.checkboxArray[i].checkboxValue = true;
                        break;
                    }
                    
                }   
            }
            for(var i=0; i<this.checkboxArray.length; i++){
                if (i==0) {
                    this.outputValueBoolean = this.checkboxArray[i].checkboxValue;
                } else {
                    this.outputValueBoolean = this.outputValueBoolean + ';' + this.checkboxArray[i].checkboxValue;
                }
                if(this.checkboxArray[i].checkboxValue == true){
                    checkedCount ++;
                    outputString = this.checkboxArray[i].checkboxLabel;
                    this.outputValueCollection.push(outputString);
                    if (this.outputValue === undefined) {
                        this.outputValue = outputString;
                    } else {
                        this.outputValue = this.outputValue + ';' + outputString;
                    }
                    outputString = '';
                }
            }
    
            if(checkedCount>0){
                this.checked = true;
                this.dispatchCheckboxEvent();
                
            }else{
                this.checked = false;
            }    
               
                //this.checkboxArray.push(checkboxObj);               
        }

        this.showInfo = true;
     }
 
     handleClick(event) {
         
         this.outputValueCollection = [];
         this.outputValueBoolean = '';
         this.outputValue = '';
         let outputString = '';
         let checkboxId = event.target.dataset.id;
         let checkedCount = 0;
 
         for(var i=0; i<this.checkboxArray.length; i++){
             if(this.checkboxArray[i].checkboxLabel == checkboxId){
                 this.checkboxArray[i].checkboxValue = event.target.checked;
             }
             if (i==0) {
                 this.outputValueBoolean = this.checkboxArray[i].checkboxValue;
             } else {
                 this.outputValueBoolean = this.outputValueBoolean + ';' + this.checkboxArray[i].checkboxValue;
             }
             if(this.checkboxArray[i].checkboxValue == true){
                 checkedCount ++;
                 outputString = this.checkboxArray[i].checkboxLabel;
                 this.outputValueCollection.push(outputString);
                 if (this.outputValue.length==0) {
                     this.outputValue = outputString;
                 } else {
                     this.outputValue = this.outputValue + ';' + outputString;
                 }
                 outputString = '';
             }
         }
         if(checkedCount>0){
             this.checked = true;
             
         }else{
             this.checked = false;
         }
 
         this.dispatchCheckboxEvent();
         //check if message to be sent (as sender)
         this.checkVisibility();
         this.isVisible = true;
     }
     
     handleVisibilitySubscription(message){
        if(this.isListeningMode === true){
            console.log('In checking visiblity');
            this.isVisible = false;
            var messageReceived = message.componentValue;
            var messageSender = message.componentId;
            console.log('messageReceived'+ messageReceived);
            if(messageReceived === this.visibilityValueReceiver){                
                if(messageSender === this.visibilitySender){
                    this.isVisible = true;
                }
            }
        }
    }
 
 
     dispatchCheckboxEvent() {
         // tell the flow engine about the change
         const attributeChangeEvent = new FlowAttributeChangeEvent('outputValue', this.outputValue);
         this.dispatchEvent(attributeChangeEvent);
 
         // tell any parent components about the change
         const valueChangedEvent = new CustomEvent('valuechanged', {
             detail: {
                 id: this.fieldId,
                 value: this.outputValue,
             }
         });
         this.dispatchEvent(valueChangedEvent);
     }
 
     
 
 
     // LMS functions
 
     subscribeMCs() {
         if (this.validateSubscription) {
             return;
         }
         this.validateSubscription = subscribe (
             this.messageContext,
             VALIDATION_MC, (message) => {
                 this.handleValidateMessage(message);
             });
        if(this.isListeningMode === true){
            console.log('subscribing to channel!!!!');
            //rardio box becomes also receiver to the MC
            this.visibilitySubscription = subscribe(
                this.messageContext,
                VISIBILITY_MC,(message) => {
                    this.handleVisibilitySubscription(message);
                });            
        }
     }
 
     unsubscribeMCs() {
         unsubscribe(this.validateSubscription);
         this.validateSubscription = null;
     }
 
     handleValidateMessage(message) {
         this.handleValidation()
     }
 
     @api handleValidation() {
         this.hasErrors = false;
        if(this.isVisible === true){
            if(this.required && !this.checked) {
                this.hasErrors = true;
            } else {
                this.hasErrors = false; 
            }
        }
 
         //console.log('CHECKBOX: Sending validation state message');
         publish(this.messageContext, VALIDATION_STATE_MC, {
             componentId: this.fieldId,
             isValid: !this.hasErrors,
             error: this.errorMessage
         });
         return !this.hasErrors;
     }
 
     @api clearError() {
         this.hasErrors = false;
     }
 }