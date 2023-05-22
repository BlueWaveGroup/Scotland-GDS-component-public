import { LightningElement, api } from 'lwc';

export default class GovAccordionHTML extends LightningElement {
    @api markupText;
    @api initialised;
    @api sectionLabel;
    @api customKey="1234";

    renderedCallback() {
        if(this.initialised) {
            return;
        }
        const htmlElement = this.template.querySelector(".html-element");
        if(htmlElement) {
            htmlElement.innerHTML = this.markupText;
            this.initialised = true;
        }        
    }

    handleclick(event){
        let targetId = event.target.dataset.id;
        let target = this.template.querySelector(`[data-id="Content${targetId}"]`);
        if(target.classList.value.includes("govuk-accordion__section--expanded")){
            target.classList.remove('govuk-accordion__section--expanded');
        }else{
            target.classList.add('govuk-accordion__section--expanded');
        }
    }
    
    handlebuttonclick(event){
        for(let i=0; i<this.sectionArray.length; i++){
            let target = this.template.querySelector(`[data-id="Content${this.sectionArray[i].secId}"]`);
            if(this.openAndCLoseAllText.includes('Close')){
                target.classList.remove('govuk-accordion__section--expanded');
            }else{
                target.classList.add('govuk-accordion__section--expanded');
            }
        }
        this.openAndCLoseAllText = this.openAndCLoseAllText.includes('Open') ? 'Close All' : 'Open All' ;
    }
}