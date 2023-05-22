/**
 * Component Name: Gov UK File Upload
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
 import { LightningElement, wire, api, track } from 'lwc';
 import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
 import saveFiles from '@salesforce/apex/FileUploadController.saveFiles';
 import { MessageContext, publish, subscribe, unsubscribe } from 'lightning/messageService';
 import REGISTER_MC from '@salesforce/messageChannel/registrationMessage__c';
 import VALIDATION_MC from '@salesforce/messageChannel/validateMessage__c';
 import VALIDATION_STATE_MC from '@salesforce/messageChannel/validationStateMessage__c';

 const columns = [{
    label: 'Title',
    fieldName: 'FileName',
    type: 'url',
    typeAttributes: {
        label: {
            fieldName: 'Title'
        },
        target: '_blank'
    }
}];
 
 export default class GovFileUpload extends LightningElement {
     
     @api fieldId = "uploadField";
     @api fileUploadLabel = "Upload a file";
     @api acceptedFormats = "image/png, image/jpg, .pdf, .doc, .docx, .zip";
     @api maxFileSizeInMB = 2;
     @api required = false;
     @api errorMessage = "Select a file"; 
 
     @api filesUploadedCollection = []; 
     @api filesUploadedExpanded = []; 
     @api filesUploaded; 
 
     @api useApexToSaveFile;   
     @api recordId = "";
     
     @track hasErrors = false;
     @track fileNames = [{name:'test1'},
    {name:'test2'}];
     @track columns = [{ label: 'Label', fieldName: 'name' }];
 
     get formGroupClass() {
         let formGroupClass = "";
         formGroupClass =  this.hasErrors ? "ds_form-group ds_form-group--error" : "ds_form-group";
         return formGroupClass;
     }
 
     get inputClass() {
         let inputClass = "";
         inputClass =  this.hasErrors ? "ds_file-upload ds_file-upload--error" : "ds_file-upload";
         return inputClass;
     }
 
     handleFilesChange(event) {
         this.clearError();
         let files = event.target.files;
         if(files.length > 0) {
             let filesName = '';
             for (let i = 0; i < files.length; i++) {
                 let file = files[i];
                 filesName = filesName + file.name + ',';
                 if(file.size > (this.maxFileSizeInMB * 1000000)) {
                     this.hasErrors = true;
                     this.errorMessage = `The selected file(s) must be smaller than ${this.maxFileSizeInMB} MB`;
                     return;
                 }
                 let freader = new FileReader();
                 freader.onload = f => {
                     let base64 = 'base64,';
                     let content = freader.result.indexOf(base64) + base64.length;
                     let fileContents = freader.result.substring(content);
                     if (i==0) {
                         this.filesUploaded = file.name;
                     } else {
                         this.filesUploaded = this.filesUploaded + ';' + file.name;
                     }
                     this.filesUploadedCollection.push(file.name);
                     this.filesUploadedExpanded.push({
                         Title: file.name,
                         VersionData: fileContents
                     });
                     this.useApexToSaveFile = true;
                     if(this.recordId !== "" && this.useApexToSaveFile && (i+1) === files.length) {
                         this.handleSaveFiles();
                     } 
                     if((i+1) === files.length) {
                         this.dispatchUploadEvent();
                     }  
                 };
                 freader.readAsDataURL(file);
             }
             this.fileNames = filesName.slice(0, -1);
         }
     }
 
     handleSaveFiles() {
         saveFiles({
             filesToInsert: this.filesUploadedExpanded,
             strRecId: this.recordId
          })
         .then(data => {
         })
         .catch(error => {
             this.hasErrors = true;
             this.errorMessage = error;
         }); 
     }
 
     // messaging attributes
     @wire(MessageContext) messageContext;
     validateSubscription;
 
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
 
     connectedCallback() {
         // subscribe to the message channels
         this.subscribeMCs();
 
         // publish the registration message after 0.1 sec to give other components time to initialise
         setTimeout(() => {
             publish(this.messageContext, REGISTER_MC, { componentId: this.fieldId });
         }, 100);
     }
 
     disconnectedCallback() {
         this.unsubscribeMCs();
     }
 
     handleValidateMessage(message) {
         this.handleValidate();
     }
 
     @api 
     handleValidate() {
         this.hasErrors = false;
         if(this.required && this.filesUploadedExpanded.length === 0) {
             this.hasErrors = true;
         }
         publish(this.messageContext, VALIDATION_STATE_MC, {
             componentId: this.fieldId,
             isValid: !this.hasErrors,
             error: this.errorMessage
         });
         return !this.hasErrors;
     }
 
     @api 
     clearError() {
         this.hasErrors = false;
     }
 
     dispatchUploadEvent() {
         // tell the flow engine about the upload
         const attributeChangeEvent = new FlowAttributeChangeEvent('value', JSON.stringify(this.filesUploaded));
         this.dispatchEvent(attributeChangeEvent);
 
         // tell any parent components about the upload
         const fileUploadEvent = new CustomEvent('fileUpload', {
             detail: {
                 id: this.fieldId,
                 value: JSON.stringify(this.filesUploaded)
             }
         });
         this.dispatchEvent(fileUploadEvent);
     }

     removeReceiptImage(event) {
        var index = event.currentTarget.dataset.id;
        this.filesData.splice(index, 1);
    }
 
 }