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
 import VISIBILITY_MC from '@salesforce/messageChannel/visibilityMessage__c';

export default class GovRadiobox extends LightningElement {

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
    @api errorMessage = 'There is an error';
    @api visibilityValue = '';
    @api visibilitySender;
    
    
    @track isInitialised = false;
    @track hasErrors = false;
    @track radioOptions = [];
    @track isVisible = true;
    
    @track isListeningMode = false;
    
    
    // messaging attributes
    @wire(MessageContext) messageContext;
    validateSubscription;
    visibilitySubscription

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

       
        //checking if it is in listening mode
        if(this.visibilitySender !== '' && this.visibilitySender !== undefined){
            if(this.visibilityValue !== '' && this.visibilityValue !== undefined){
                this.isListeningMode = true;
                this.isVisible = false;
                console.log('listening mode' + this.isListeningMode);
            }
        }

         // subscribe to the message channels
         this.subscribeMCs();


        // publish the registration message after 0.1 sec to give other components time to initialise
        setTimeout(() => {
            publish(this.messageContext, REGISTER_MC, { componentId: this.uniqueFieldId });
        }, 100);

        setTimeout(() => {
            console.log('in selecte value');
            this.notifyChannelOnLoad();},300);
        //}
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
        this.notifyChannel();
    }

    notifyChannel(){
        if(this.isListeningMode === false){
            console.log('in notify');
            if(this.radioOptions.length > 0){
                for(let i=0; i<this.radioOptions.length;i++) {
                    if(this.radioOptions[i].checked === true){
                        console.log('HERE' + this.radioOptions[i].value);                    
                        publish(this.messageContext, VISIBILITY_MC, {
                            componentValue: this.radioOptions[i].value,
                            componentId: this.uniqueFieldId
                        });
                    }
                }
            }
        }
    }

    notifyChannelOnLoad(){
        if(this.isListeningMode === false){
            console.log('in notify selected' + this.selectedValue);
        
            if(this.selectedValue.length > 0) {   
                console.log('in HERE');                 
                publish(this.messageContext, VISIBILITY_MC, {
                    componentValue: this.selectedValue,
                    componentId: this.uniqueFieldId
                });
            }
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
        if(this.isVisible === true){
            if(this.requiredQuestion && (this.selectedValue === '' || this.selectedValue === undefined)) {
                this.hasErrors = true;
                console.log('here');
            }
        }
        publish(this.messageContext, VALIDATION_STATE_MC, {
            componentId: this.uniqueFieldId,
            isValid: !this.hasErrors,
            error: this.errorMessage
        });
        return !this.hasErrors;
    }

    @api 
    clearError() {
        this.hasErrors = false;
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

    handleVisibilitySubscription(message){
        if(this.isListeningMode === true){
            console.log('In checking visiblity');
            this.isVisible = false;
            var messageReceived = message.componentValue;
            var messageSender = message.componentId;
            console.log('messageReceived'+ messageReceived);
            if(messageReceived === this.visibilityValue){                
                if(messageSender === this.visibilitySender){
                    this.isVisible = true;
                }
            }
        }
    }
}