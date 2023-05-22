import { LightningElement, api, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getRelatedFiles from '@salesforce/apex/customFileUploadctrl.getRelatedFiles';
import deleteFile from '@salesforce/apex/customFileUploadctrl.deleteFile';
import updateType from '@salesforce/apex/customFileUploadctrl.updateType';
import updateFile from '@salesforce/apex/customFileUploadctrl.updateFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import DESCRIPTION from '@salesforce/schema/ContentVersion.Description';
import CONTENTVERSIONID from '@salesforce/schema/ContentVersion.Id';
import { MessageContext, publish, subscribe, unsubscribe } from 'lightning/messageService';
import VISIBILITY_MC from '@salesforce/messageChannel/visibilityMessage__c';

export default class FileUploadView extends LightningElement{

    //static delegatesFocus = true;

    @api label;
    @api formats = '.png,.pdf,.xls,.xlsx,.doc,.docx';
    @api recordId;
    @api sectionType='General';
    @api screen='default';
    @track fileDeleteId;
    @track wireGetFiles = [];
    @track fileId;
    @track description;
    @track uploadedFiles =[];
    @track fileDocumentId = [];
    @track hasData = false;
    @track descriptionEntered;
    @track showError = false;
    @track uniqueFieldId = 'File Upload';
    @track inputClass;

    @track files;
    @track fileData;

   

    get encryptedToken() {
        //use apex to get
        return this.recordId;
    }

   /*@wire(getRelatedFiles, { recordId: '$recordId', sectionType: '$sectionType', screen: '$screen'}) fileList(result){
        this.wireGetFiles = result;
            if(result.data){
            console.log('has result');
            console.log('record id is' + this.recordId);
            this.files = result.data;
            if(this.files.length > 0) {
                this.hasData = true
            }   

        }
        else if (result.error){
            console.log(result.error);
        }
    }*/

     // messaging attributes
     @wire(MessageContext) messageContext;    
     visibilitySubscription;

    connectedCallback(){
         // subscribe to the message channels       
        this.getRelatedFilesInfo();
        console.log('this.hasData' + this.hasData);        
        console.log('in connected call back');
        this.inputClass = "dsFileUpload";

       
    }

    get acceptedFormats() {
        return ['.pdf', '.png','.xls','.xlsx','.doc','.docx'];
    }

    renderedCallback(){
        
        //console.log("Component class: " + this.template.querySelector(`[data-id="fileUpload"]`).classList);
        setTimeout(() => {
            console.log(document.activeElement.blur());
            console.log("Focusing component...");
            this.template.querySelector(".dsFileUpload").focus();
        }, 1000); //console.log(this.template.activeElement.blur());
        
    }

    getRelatedFilesInfo(){
        console.log('in handle get info');
        this.hasData = false;
        getRelatedFiles({recordId: this.recordId, sectionType: this.sectionType, screen: this.screen})
        .then ((result) => {             
                this.files = result;
                console.log('this.files' + this.files.length);
                if(this.files.length > 0) {
                    this.hasData = true;
                    console.log('this.hasData in end' + this.hasData);
                }   
                setTimeout(() => {
                    publish(this.messageContext, VISIBILITY_MC, {
                      componentValue: this.hasData,
                       componentId: this.uniqueFieldId
                   });
                }, 300);
                
                })
        .catch((error) => {
            console.log('error ' + error);
            this.files = undefined;
        });
        
        
        
    }
   
     handleActionFinished(event) {
        //refresh the list of files  
        
        this.uploadedFiles = event.detail.files;
        
        console.log('filedoc starting'+ this.uploadedFiles.length);
        console.log('sectiontype' + this.sectionType);
        
        for(let i=0; i<this.uploadedFiles.length; i++){
            console.log(this.uploadedFiles[i].documentId);
            this.fileDocumentId.push(this.uploadedFiles[i].documentId);
        }

        console.log('filedoc' + this.fileDocumentId);


        updateType({documentArray: this.fileDocumentId, sectionType: this.sectionType, screen: this.screen})
                .catch(error => {
                    console.log("error");
                });
        // Get the file name
        //uploadedFiles.forEach(file => {console.log(file.Id))});      
        this.getRelatedFilesInfo();
        
    }

    handleDescriptionUpdate(event){
        this.fileId = event.detail.fileId;
        this.description = event.detail.description;
        console.log('fileid' + this.fileId + 'description' + this.description);

        const fields = {};
            fields[CONTENTVERSIONID.fieldApiName] = this.fileId;
            fields[DESCRIPTION.fieldApiName] = this.description;

            const recordInput = { fields };
            updateRecord(recordInput)
                .then(() => {
                    console.log('update descrption');
                    this.getRelatedFilesInfo();
                })               

                .catch(error => {
                    console.log(error.body);
                });
    }

    handleDeletion(event){
        this.fileDeleteId = event.detail;
        console.log('this.fileDeleteId' + this.fileDeleteId);
        
            deleteFile({ fileId: this.fileDeleteId}).then (result =>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'File deleted',
                        variant: 'success'
                    })
                );
                this.getRelatedFilesInfo();   
                
            }).catch(err => {
                console.log('error' +  error);
            })   
        
    }

    handleUploadFinished(event) {
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        let documentId = uploadedFiles[0].documentId;
        console.log('FILE UPLOADED' + uploadedFiles[0].documentId);
        this.fileData = uploadedFiles[0].documentId;
        
    }


     ////////////////////////////////////c/applicationTypeSelectionCmpfileData
   /* openfileUpload(event) {
        console.log('here');        
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordId
            }
            console.log(this.fileData)
        }
        reader.readAsDataURL(file)
    }*/
    
    handleClick(){
        const {base64, filename, recordId} = this.fileData
        console.log('filename' + this.sectionType + ' screen' + this.screen);
        
        this.showError = false;
        if(this.descriptionEntered == '' || this.descriptionEntered == undefined){
            this.showError = true;
        }else{           
            updateFile({documentId: this.fileData, sectionType: this.sectionType, screen: this.screen, description: this.descriptionEntered, recordId: this.recordId}).then(result=>{
                this.fileData = null
                let title = `${filename} uploaded successfully!!`  
                
                this.getRelatedFilesInfo();   
                                      
            })

             
        }
    }

    handleCancel(event){
        this.fileData = null;        
    }

    handleDescription(event){
        this.descriptionEntered = event.target.value;
        console.log('thjis' + this.descriptionEntered);
    }

    focusOn(event){
        console.log('on focus');
        this.inputClass = "dsFileUploaFocus";
        //this.openfileUpload();
    }

    focusOut(event){
        this.inputClass = "dsFileUpload";

    }
 
     
}