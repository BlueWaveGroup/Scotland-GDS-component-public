/**
 * Component Name: Gov UK Navigation Buttons
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Simon Cook Updated by Harshpreet Singh Chhabra/Brenda Campbell
 **/
 import {LightningElement, api, track, wire} from 'lwc';
 import { FlowNavigationBackEvent, FlowNavigationNextEvent, FlowNavigationFinishEvent } from 'lightning/flowSupport';
 import { MessageContext, publish, subscribe, unsubscribe } from 'lightning/messageService';
 import REGISTER_MC from '@salesforce/messageChannel/registrationMessage__c';
 import VALIDATE_MC from '@salesforce/messageChannel/validateMessage__c';
 import VALIDATION_STATE_MC from '@salesforce/messageChannel/validationStateMessage__c';
 import backButton from '@salesforce/resourceUrl/backButton';
 import forwardButton from '@salesforce/resourceUrl/forwardButton';
 
 export default class GovNavigationButtons extends LightningElement {
     // flow actions
     @api availableActions = [];
     
     @api nextLabel = 'Next';
     @api showBackButton = false;
     @api hideBackButton = false;
 
     // messaging attributes
     @wire(MessageContext) messageContext;
     registrationSubscription;
     validationStateSubscription;
 
     // flow inputs and outputs
     @api buttonLabelsString;
     @api buttonActionsString;
     @api buttonVariantsString;
     @api buttonAlignmentsString;
     @api action;
     @api fieldId = 'NavigationButtons';
     @api useFlowStyling;
 
     // tracked attributes
     @track leftButtons = [];
     @track centerButtons = [];
     @track rightButtons = [];

     backButton = backButton;
     forwardButton = forwardButton;
 
     // other attributes
     components = [];
 
     // Lifecycle listeners
 
     connectedCallback() {
         // subscribe to registration events
         this.subscribeMCs()
 
     }
 
     disconnectedCallback() {
         this.unsubscribeMCs();
     }
 
 
     // class related functions
    
 
     // Event handlers functions
     handleClick(event) {
         // get the action for the data-action attribute
         console.log('IN EVENT');
         this.action = event.target.getAttribute('data-action').toUpperCase();
         console.log('this.action ' + this.action );
         //console.log(`action is ${this.action}`);
         //console.log(`available actions are ${this.availableActions}`);
         
         //console.log(`component api name is ${this.fieldId}`);
         //console.log(`NAVIGATION_BUTTONS: components are ${JSON.stringify(this.components)}`);
         // check to see if next or finish was selected and we have components to validate
         if( (this.action === 'NEXT' || this.action === 'FINISH') && this.components.length > 0 ) {
             this.components.forEach(component => {
                 component.isValid = false;
             })
             //console.log('NAVIGATION_BUTTONS: Sending validation message');
             publish(this.messageContext, VALIDATE_MC, { componentId: this.fieldId });
         } else if(this.action === 'NEXT' && this.availableActions.find(action => action === 'NEXT')) {
             const event = new FlowNavigationNextEvent();
             this.dispatchEvent(event);
         } else if(this.action === 'FINISH' && this.availableActions.find(action => action === 'FINISH')) {
             const event = new FlowNavigationFinishEvent();
             this.dispatchEvent(event);
         } else if (this.action === 'CANCEL' &&
             (this.availableActions.find(action => action === 'NEXT'))) {
             const event = new FlowNavigationNextEvent();
             this.dispatchEvent(event);
         } else if (this.action === 'CANCEL' &&
             (this.availableActions.find(action => action === 'FINISH'))) {
             const event = new FlowNavigationFinishEvent();
             this.dispatchEvent(event);
         } else if (this.action === 'BACK' &&
             this.availableActions.find(action => action === 'BACK')) {
             const event = new FlowNavigationBackEvent();
             this.dispatchEvent(event);
         }
     }
 
 
     // Messaging related functions
     subscribeMCs() {
         if (this.registrationSubscription) {
             return;
         }
         this.registrationSubscription = subscribe (
             this.messageContext,
             REGISTER_MC, (message) => {
                 this.handleRegistrationMessage(message);
             });
         if (this.validationStateSubscription) {
             return;
         }
         this.validationStateSubscription = subscribe (
             this.messageContext,
             VALIDATION_STATE_MC, (message) => {
                 this.handleValidationUpdate(message);
             });
     }
 
     unsubscribeMCs() {
         unsubscribe(this.registrationSubscription);
         this.registrationSubscription = null;
         unsubscribe(this.validationStateSubscription);
         this.validationStateSubscription = null;
     }
 
 
     handleRegistrationMessage(message) {
         //console.log(`NAVIGATION_BUTTONS: Received registration message from component ${JSON.stringify(message)}`);
         const component = {};
         component.id = message.componentId;
         component.isValid = true;
         component.error = "";
         this.components.push(component);
         //console.log(`NAVIGATION_BUTTONS: Component are ${JSON.stringify(this.components)}`);
     }
 
     handleValidationUpdate(message) {
         console.log(`NAVIGATION_BUTTONS: Received validation state message from component ${JSON.stringify(message)}`);
 
         // update the component that sent the message
         const component = this.components.find(component => component.id === message.componentId);
         if(component) {
             //console.log(`NAVIGATION_BUTTONS: Setting component ${component.id} to ${message.isValid}`);
             component.isValid = message.isValid;
         } else {
             //console.log(`NAVIGATION_BUTTONS: This shouldn't really happen but creating new component ${message.id} with status ${message.isValid}`);
             this.components.push({id:message.id,isValid:message.isValid});
         }
 
         //console.log(`NAVIGATION_BUTTONS: components are ${JSON.stringify(this.components)}`);
 
         // check to see if we have all valid components
         const invalidComponents = this.components.filter(component => component.isValid === false);
         if(invalidComponents.length === 0) {
             //console.log(`NAVIGATION_BUTTONS: All components are valid, moving along, action is ${this.action}`);
             if (this.action === 'NEXT' &&
                 this.availableActions.find(action => action === 'NEXT')) {
                 const event = new FlowNavigationNextEvent();
                 this.dispatchEvent(event);
             } else if (this.action === 'NEXT' &&
                 this.availableActions.find(action => action === 'FINISH')) {
                 const event = new FlowNavigationFinishEvent();
                 this.dispatchEvent(event);
             } else if (this.action === 'FINISH' &&
                 this.availableActions.find(action => action === 'FINISH')) {
                 const event = new FlowNavigationFinishEvent();
                 this.dispatchEvent(event);
             }
         } else {            
             console.log(`NAVIGATION_BUTTONS: There are invalid components.`);
         }
     }
 
 }