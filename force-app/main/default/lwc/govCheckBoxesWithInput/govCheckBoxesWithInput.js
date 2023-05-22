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
 
 export default class GovCheckBoxesWithInput extends LightningElement {
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
 
     @track checkboxArray = [];
     @track checked = false;
     @track showInfo = false;
     @track checkboxArrayInit = [];
     @track defaultValuesList;
 

     @api fieldIdText = "textField";
     @api label;
     @api hint;
     @api value = '';
     @api characterLimit;
     @api requiredInput;
     @api errorMessageInput = 'There is an error';
     @api labelFontSize;
     @api fontSize = '';
     @api maxCharacterCount = 32768;
     @api showCharacterCount;
     @api rowCount = 5;
     @api regexPattern = '';
     @api visibilityValue = '';
     @api textinputType = '1';
     @api prefix = '';
     @api suffix = '';

     @track displayCharacterLimit;
    @track hasErrors;
    @track charCount;
    @track regularExpression;
    
    @track isInitialised = false;
    @track hasErrors = false;
    @track hasInputErrors = false;
   
   
    @track isTextInputVisible = false;
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
     get inputClass() {
        return this.hasInputErrors ? `ds_input ds_input-js-character-count ds_input--error` : `ds_input ds_input-js-character-count`;
    }

    get groupClass() {
        let groupClass = "ds_form-group";
        groupClass = (this.hasInputErrors) ? groupClass + " ds_form-group--error" : groupClass;
        return groupClass;
    }

    get labelClass() {
        let labelClass;

        switch(this.fontSize) {
            case "Small":
                labelClass = "ds_label ds_label--s";
                break;
            case "Medium":
                labelClass = "ds_label ds_label--m";
                break;
            case "Large":
                labelClass = "ds_label ds_label--l";
                break;
            default:
                labelClass = "ds_label ds_label--s";
        }
        return labelClass;
    }

    get characterCountText() {
       if(this.showCharacterCount) {
           if(this.charCount === 0 && this.maxCharacterCount) {
               return `${this.maxCharacterCount - this.charCount} characters remaining`;
           }
           let text = "";
           if(this.maxCharacterCount) {
               text = `${this.maxCharacterCount - this.charCount} characters remaining`;
           } else {
               text = `${this.charCount} characters`;
           }
           return text;
       }
   }
 
     connectedCallback() {
        console.log('this is hitting');
        console.log('this.outputValueBoolean' + this.outputValueBoolean);
        this.showInfo = false;
        let defaultValuesBooleanList = [];
        this.isVisible = false;
        
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
         
         this.checkVisibility();

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

         setTimeout(() => {
            publish(this.messageContext, REGISTER_MC, {componentId:this.fieldIdText});
        }, 100);
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
 
     // Event Functions

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
                    if(this.checkboxArray[i].checkboxLabel == this.defaultValuesList[j]){
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
         console.log('in handle clikc');
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
         
         this.checkVisibility();
         this.dispatchCheckboxEvent();
     }

     //update to text
   handleKeyUp(event) {
        
    if(this.charCount <= this.maxCharacterCount) {
        this.value = event.target.value;
    }
    this.charCount = this.value.length;
    this.dispatchTextAreaEvent()
    }

    dispatchTextAreaEvent() {
        // tell the flow engine about the change
        const attributeChangeEvent = new FlowAttributeChangeEvent('value', this.value);
        this.dispatchEvent(attributeChangeEvent);

        // tell any parent components about the change
        const valueChangedEvent = new CustomEvent('valuechanged', {
            detail: {
                id: this.fieldId,
                value: this.value,
            }
        });
        this.dispatchEvent(valueChangedEvent);
    }


    disconnectedCallback() {
        this.unsubscribeMCs();
    }

   
 
     checkVisibility(){
        this.isVisible = false;
        
        if(this.outputValue !== undefined && this.outputValue.length > 0){
            const outputValueArray = this.outputValue.split(';');
            console.log('this.visibilityValue' + this.visibilityValue);
            for(var i=0; i<outputValueArray.length; i++){
                
                if(outputValueArray[i] === this.visibilityValue){
                    console.log('is true');
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
 
         if(this.required && !this.checked) {
             this.hasErrors = true;
         } else {
             this.hasErrors = false;
         }
 
         //console.log('CHECKBOX: Sending validation state message');
         publish(this.messageContext, VALIDATION_STATE_MC, {
             componentId: this.fieldId,
             isValid: !this.hasErrors,
             error: this.errorMessage
         });

         console.log('in validate' + this.isVisible);
         this.hasInputErrors = false;
         if(this.isVisible === true){    
             //validation for text input
             if(this.requiredInput && this.value === "") {
                 this.hasInputErrors = true;
             } else {
                 if (this.regularExpression !== undefined && this.regularExpression !== '' && this.value !== '') {
                     if (!this.regularExpression.test(this.value)) {
                         this.hasInputErrors = true;
                     }
                 }
             }
         }
         publish(this.messageContext, VALIDATION_STATE_MC, {
             componentId: this.fieldIdText,
             isValid: !this.hasInputErrors,
             error: this.errorMessageInput
         });
        // return !this.hasErrors;
     }
 
     @api clearError() {
         this.hasErrors = false;
     }
 }