/**
 * Component Name: Gov UK Warning Text
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
 import {LightningElement, api, track, wire} from 'lwc';
 import {FlowAttributeChangeEvent} from 'lightning/flowSupport';
 import { MessageContext, publish, subscribe, unsubscribe } from 'lightning/messageService';
 import REGISTER_MC from '@salesforce/messageChannel/registrationMessage__c';
 import VALIDATION_MC from '@salesforce/messageChannel/validateMessage__c';
 import VALIDATION_STATE_MC from '@salesforce/messageChannel/validationStateMessage__c';
 import VISIBILITY_MC from '@salesforce/messageChannel/visibilityMessage__c';

export default class GovTextInput extends LightningElement {

    @api fieldId = "textField";
    @api label;
    @api hint;
    @api value = '';
    @api characterLimit;
    @api required;
    @api errorMessage = 'There is an error';
    @api labelFontSize;
    @api fontSize = 'Medium';
    @api maxCharacterCount = 327;
    @api showCharacterCount;
    @api rowCount = 5;
    @api prefix = '';
    @api suffix = '';
    @api regexPattern = '';
    @api visibilityValue = '';
    @api visibilitySender;
    

    @track isVisible = false;
    @track isListeningMode = false;

    @track displayCharacterLimit;
    @track hasErrors;
    @track charCount; 
    @track regularExpression;

    // messaging attributes
    @wire(MessageContext) messageContext;
    validateSubscription;
    visibilitySubscription;

    connectedCallback() {
        // set the value to blank if it's undefined
        this.value = (this.value === undefined) ? '' : this.value;
        if (this.value === 'Application in progress'){
            this.value ='';
        }

        // set the char count based on value length
        this.charCount = (this.value) ? this.value.length : 0;

        // create the regex
        if(this.regexPattern) {
            this.regularExpression = new RegExp(this.regexPattern);
        }

        //should the cmp listen to the message channel
        this.isListeningMode = true;
        if(this.visibilityValue === undefined || this.visibilityValue === ''){ //not setup to listen
            this.isVisible = true;
            this.isListeningMode = false;
        }

        // subscribe to the message channels
        this.subscribeMCs();

        // publish the registration message after 0.1 sec to give other components time to initialise
        setTimeout(() => {
            publish(this.messageContext, REGISTER_MC, {componentId:this.fieldId});
        }, 100);
    }

    disconnectedCallback() {
        this.unsubscribeMCs();
    }

    get inputClass() {
        return this.hasErrors ? `ds_input ds_input-js-character-count ds_input--error` : `ds_input ds_input-js-character-count`;
    }

    get groupClass() {
        let groupClass = "ds_form-group";
        groupClass = (this.hasErrors) ? groupClass + " ds_form-group--error" : groupClass;
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
        this.visibilitySubscription = subscribe(
            this.messageContext,
            VISIBILITY_MC,(message) => {
                this.handleVisibilitySubscription(message);
            });
            
    }

    unsubscribeMCs() {
        unsubscribe(this.validateSubscription);
        this.validateSubscription = null;
    }

    handleValidateMessage(message) {
        this.handleValidate()
    }
    handleVisibilitySubscription(message){
        //this.handleNewReg();
        if(this.isListeningMode == true){
            this.isVisible = false;
            console.log(`InTEXTAREA ${JSON.stringify(message)}`);
            var messageReceived = message.componentValue;
            var messageSender = message.componentId;
            console.log('messageReceived'+ messageReceived);
            if(messageReceived === this.visibilityValue){
                if(this.visibilitySender !=='' && this.visibilitySender !== undefined){
                    if(messageSender === this.visibilitySender){
                        this.isVisible = true;
                    }
                }else{
                    this.isVisible = true;
                }                
            }else{
                this.isVisible = false;
                this.value = '';
                this.dispatchTextAreaEvent();
            }
        }
    }
    @api handleValidate() {
        this.hasErrors = false;
        if(this.isVisible == true){
            console.log('this.value.toLowerCase' + this.value.toLowerCase());
            if(this.required && this.value === "") {
                this.hasErrors = true;
            } else if (this.value.toLowerCase() ==='null'){
                this.hasErrors = true;
            } else{
                if (this.regularExpression !== undefined && this.regularExpression !== '' && this.value !== '') {
                    if (!this.regularExpression.test(this.value)) {
                        this.hasErrors = true;
                    }
                }
            }
        }

        //console.log('CHECKBOX: Sending validation state message');
        publish(this.messageContext, VALIDATION_STATE_MC, {
            componentId: this.fieldId,
            isValid: !this.hasErrors,
            error: this.errorMessage
        });
    }

    @api clearError() {
        this.hasErrors = false;
    }
}