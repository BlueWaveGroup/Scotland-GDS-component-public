/**
 * Component Name: Gov Radios
 * 
 * Created by: Bluewave
 **/
 import {LightningElement, api, track, wire} from 'lwc';
 import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
 import getPicklistValuesByObjectField from '@salesforce/apex/GovComponentHelper.getPicklistValuesByObjectField';
 import { MessageContext, publish, subscribe, unsubscribe } from 'lightning/messageService';
 import REGISTER_MC from '@salesforce/messageChannel/registrationMessage__c';
 import VALIDATION_MC from '@salesforce/messageChannel/validateMessage__c';
 import VALIDATION_STATE_MC from '@salesforce/messageChannel/validationStateMessage__c';

export default class GovRadioBoxWithInput extends LightningElement {

    @api uniqueFieldId = "radioField";
    @api questionLabel;
    @api questionFontSize;
    @api questionHint;
    @api requiredQuestion;
    @api inlineRadios;
    @api smallerRadios;
    @api radioPicklistField;
    @api radioLabels = "";
    @api radioValues = "";
    @api selectedValue = "";  
    @api errorMessage;

    @api fieldId = "textField";
    @api label;
    @api hint;
    @api value = '';
    @api characterLimit;
    @api required;
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
    @track radioOptions = [];
   
    @track isTextInputVisible = false;
    @track isVisible;
    
    // messaging attributes
    @wire(MessageContext) messageContext;
    validateSubscription;

    connectedCallback() {
        if(this.radioPicklistField !== '' && this.radioPicklistField !== undefined && this.radioPicklistField !== null) {
            // get picklist field values
            getPicklistValuesByObjectField({
                strSObjectFieldName: this.radioPicklistField
            })
                .then(result => {
                    this.radioOptions = [];
                    for(let i=0; i<result.length; i++) {
                        let radioOption = {};
                        radioOption.key = `picklist-value-${i}`;
                        radioOption.value = result[i];
                        radioOption.label = result[i];
                        radioOption.checked = (this.selectedValue === result[i]);
                        this.radioOptions.push(radioOption);
                    }
                    this.isInitialised = true;
                })
                .catch(error => {
                    console.error(`Select:connectedCallback - could not get picklist values due to ${error.message}`);
                })
        } else {
            // user provided values
            const radioLabelsArray = this.radioLabels.split(',');
            const radioValuesArray = this.radioValues.split(',');
            this.radioOptions = [];
            for(let i=0; i<radioLabelsArray.length;i++) {
                let radioOption = {};
                radioOption.key = `csv-value-${i}`;
                radioOption.label = radioLabelsArray[i];
                radioOption.value = radioValuesArray[i];
                radioOption.checked = (this.selectedValue === radioValuesArray[i]);
                this.radioOptions.push(radioOption);
            }
            this.isInitialised = true;
        }

        // set the value to blank if it's undefined
        this.value = (this.value === undefined) ? '' : this.value;

        // set the char count based on value length
        this.charCount = (this.value) ? this.value.length : 0;

        // create the regex
        if(this.regexPattern) {
            this.regularExpression = new RegExp(this.regexPattern);
        }

        if(this.textinputType === '1'){
            this.isTextInputVisible = true;
        }
        // subscribe to the message channels
        this.subscribeMCs();

        // publish the registration message after 0.1 sec to give other components time to initialise
        setTimeout(() => {
            publish(this.messageContext, REGISTER_MC, { componentId: this.uniqueFieldId });
        }, 100);

        setTimeout(() => {
            publish(this.messageContext, REGISTER_MC, { componentId: this.fieldId });
        }, 100);

        this.isVisible = false;
        if(this.selectedValue !== undefined && this.selectedValue!== ''){
            this.checkVisibility();
        }
        
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

    handleValueChanged(event) {
        this.selectedValue = event.target.value;
        this.radioOptions.forEach(radioOption => {
           if(radioOption.value === this.selectedValue) {
               radioOption.checked = true;
           } else {
               radioOption.checked = false;
           }
        });
        this.dispatchRadioEvent();
        this.checkVisibility();
    }

    checkVisibility(){
        this.isVisible = false;
        if(this.selectedValue === this.visibilityValue){
            console.log('is true');
            this.isVisible = true;
        }
    }

    @api 
    setValue(newValue) {
        this.selectedValue = newValue;
        this.radioOptions.forEach( option => {
            if(option.value === newValue) {
                option.checked = true;
            } else {
                option.checked = false;
            }
        })
    }

    handleValidateMessage(message) {
        this.handleValidate();
    }

    @api 
    handleValidate() {
        this.hasErrors = false;
        if(this.requiredQuestion && (this.selectedValue === '' || this.selectedValue === undefined)) {
            this.hasErrors = true;
            console.log('here');
        }
        publish(this.messageContext, VALIDATION_STATE_MC, {
            componentId: this.uniqueFieldId,
            isValid: !this.hasErrors,
            error: this.errorMessage
        });

        console.log('in validate' + this.isVisible);
        this.hasInputErrors = false;
        if(this.isVisible === true){    
            //validation for text input
            if(this.required && this.value === "") {
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
            componentId: this.fieldId,
            isValid: !this.hasInputErrors,
            error: this.errorMessageInput
        });
        
    }

    @api 
    clearError() {
        this.hasErrors = false;
        this.hasInputErrors = false;
    }

    dispatchRadioEvent() {
        // tell the flow engine about the change
        const attributeChangeEvent = new FlowAttributeChangeEvent('selectedValue', this.selectedValue);
        this.dispatchEvent(attributeChangeEvent);

        // tell any parent components about the change
        const valueChangedEvent = new CustomEvent('valuechanged', {
            detail: {
                id: this.uniqueFieldId,
                value: this.selectedValue,
            }
        });
        this.dispatchEvent(valueChangedEvent);
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
    }

    unsubscribeMCs() {
        unsubscribe(this.validateSubscription);
        this.validateSubscription = null;
    }
}