import { LightningElement ,api, wire, track} from 'lwc';
import getGrantList from '@salesforce/apex/GrantHelper.getGrantList';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent} from 'lightning/flowSupport';

export default class GrantDataTable extends LightningElement {

    @track columns = [{
        label: 'Awarding Body',
        fieldName: 'Awarding_Body__c',
        type: 'text',
        sortable: true
    },
    {
        label: 'Year Awarded',
        fieldName: 'Year_Awarded__c',
        type: 'number',
        sortable: true
    },   
    {
        label: 'Amount Awarded',
        fieldName: 'Amount_Awarded__c',
        type: 'currency',
        sortable: true
    },
    {
        label: 'What was the grant for',
        fieldName: 'What_was_the_grant_for__c',
        type: 'Text',
        sortable: true
    },    
    {
        label: 'Terms and Conditions',
        fieldName: 'Terms_and_Conditions_Met__c',
        type: 'text',
        sortable: true
    }
    
];

    @api applicationId;

    @api get recordIdSelected(){
        return this._recordIdSelected
    }

    set recordIdSelected(value){
        this._recordIdSelected = value;
    }

    @track error;
    @track grantList;
    @track selectedId;

    //get data
    @wire(getGrantList,{ applicationId: '$applicationId' })
    wiredGrants({
        error,
        data
    }) {
        if (data) {
            this.grantList = data;
        } else if (error) {
            this.error = error;
        }
    }


    handleClickEdit(event){  
        this.selectedId = this.grantList[event.target.dataset.index].Id;     
        console.log('index' + this.grantList[event.target.dataset.index].Id);
        
        // notify the flow of the new value
        const attributeChangeEvent = new FlowAttributeChangeEvent('recordIdSelected', this.selectedId);
        this.dispatchEvent(attributeChangeEvent);
        // navigate to the next screen
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent); 
    }
}