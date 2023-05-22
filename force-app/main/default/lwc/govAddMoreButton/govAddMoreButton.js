/**
 * Component Name: Gov add more button
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/

import { LightningElement, api, track } from 'lwc';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent} from 'lightning/flowSupport';

export default class GovAddMoreButton extends LightningElement {

    @api titleText;    

    @api get isAddingMore(){
        return this._isAddingMore
    }

    set isAddingMore(value){
        this._isAddingMore = value;
    }

    @track isupdate = false;

    connectedCallback(){       
        
        // set to false by default
        const attributeChangeEvent = new FlowAttributeChangeEvent('isAddingMore', this.isupdate);
        this.dispatchEvent(attributeChangeEvent);
    }


    handleAdd(event){
        console.log('event');
        this.isupdate = true;
        
        // notify the flow of the new value
        const attributeChangeEvent = new FlowAttributeChangeEvent('isAddingMore', this.isupdate);
        this.dispatchEvent(attributeChangeEvent);
        // navigate to the next screen
        const navigateNextEvent = new FlowNavigationNextEvent();
        this.dispatchEvent(navigateNextEvent); 

    }

}