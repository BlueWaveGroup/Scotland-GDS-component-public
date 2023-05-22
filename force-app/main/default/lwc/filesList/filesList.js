import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class FilesList extends NavigationMixin(LightningElement) {

    //@track _files;
    @track displayFiles;
    @track originalMessage;
    @track isDialogVisible = false;
    @track description;
    @api filename;
    @api filedescription;
    @api fileid;
    @api filetype;  
    


    handleDelete(event) {
        if (event.target) {
            if (event.target.name === 'openConfirmation') {
                //it can be set dynamically based on your logic
                this.originalMessage = event.currentTarget.dataset.id;
                console.log(this.originalMessage);
                //shows the component
                this.isDialogVisible = true;
            } else if (event.target.name === 'confirmModal') {
                if (event.detail !== 1) {
                    console.log('delete');
                    if (event.detail.status === 'confirm') {
                        //delete content document
                        let contentDocumentId = event.detail.originalMessage;
                        
                        console.log('delete file');
                        // Creates the event with the data and send to parent
                        const selectedEvent = new CustomEvent("filedelete", {
                            detail: contentDocumentId
                        });
                        // Dispatches the event.
                        console.log('Event dispatch');
                        this.dispatchEvent(selectedEvent);         
                    }
                }
                //hides the component
                this.isDialogVisible = false;
            }
        }
    }

   
    handlechange(event){
        console.log('Handle change'+event.target.value);
        this.description = event.target.value;
        if(this.files.length > 0) {
            for(var i=0;i<this.files.length;i++){
                console.log(this.files[i].Description);
            }
            const file = event.target.files[0]
            var reader = new FileReader()
            reader.onload = () => {
                var base64 = reader.result.split(',')[1]
                this.description = file.Description;
                this.fileData = {
                    'description': file.Description,
                    'base64': base64
                }
                console.log(this.fileData)
            }
            reader.readAsDataURL(file)
        }
    }
    //@wire(getRelatedFiles, { recordId: this.originalMessage })
    //files;
    handleUpdate(event){
        
        var fileId = event.target.dataset.id;
        console.log(fileId);

        // Creates the event with the data and send to parent
        const selectedEvent = new CustomEvent("fileupdate", {
            detail:{
                fileId: fileId,
                description: this.description
            }
        });
        // Dispatches the event.
        console.log('Event dispatch');
        
        this.dispatchEvent(selectedEvent);         
    }
        

}