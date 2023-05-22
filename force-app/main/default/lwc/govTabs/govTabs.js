/**
 * Component Name: Gov Tabs
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
 import { LightningElement, api, track } from 'lwc';

 export default class GovTabs extends LightningElement {
 
     @api title = "";
     @api titleSize = "Large";
     @api tabNames = "";
     @api tabData = "";
 
     @track data = [];
 
     get titleClass() {
         let titleClass;
         switch(this.titleSize.toLowerCase()) {
             case "small":
                 titleClass = "ds_tabs__title-s";
                 break;
             case "medium":
                 titleClass = "ds_tabs__title-m";
                 break;
             case "large":
                 titleClass = "ds_tabs__title-l";
                 break;
             default:
                 titleClass = "ds_tabs__title-l";
         }
         return titleClass;
     }
 
     connectedCallback() {
         try {
             // get the page Labels and API Names
             let tabs = this.tabNames.split("|");
             let data = this.tabData.split("|");
             
             for (let i = 0; i < tabs.length; i++) {
                 this.data.push({
                     heading: tabs[i],
                     bodyText: data[i],
                     headerClass: (i === 0) ? "ds_tabs__tab" : "ds_tabs__tab",
                     tabClass: (i === 0) ? "ds_tabs__tab-link" : "ds_tabs__tab-link", 
                     bodyClass: (i === 0) ? "ds_tabs__content" : "ds_tabs__content--hidden"
                 });
             }
         } catch (err) {
             console.error(err);
         }
     }
 
     handleTabSelection(event) {
         this.template.querySelectorAll('.ds_tabs__tab-item--selected').forEach(element => {
             element.classList.remove("ds_tabs__tab-item--selected");
         });
         
         this.template.querySelectorAll('.ds_tabs__tab-link').forEach(element => {
             element.classList.remove("ds_tabs__tab-link");
             element.classList.add("ds_tabs__tab-link");
         });
 
         this.template.querySelectorAll('.ds_tabs__content').forEach(element => {
             element.classList.remove("ds_tabs__content"); 
             element.classList.add("ds_tabs__content--hidden");
         });
           
         this.template.querySelectorAll(`[data-id="${event.currentTarget.dataset.id}"]`).forEach(element => {
             if(element.classList[0] === "ds_tabs__tab-item") {
                 element.classList.remove("ds_tabs__tab-link"); 
                 element.classList.add("ds_tabs__tab-item--selected");    
             }
             if(element.classList[0] === "ds_tabs__tab-link") {
                 element.classList.remove("ds_tabs__tab-link"); 
                 element.classList.add("ds_tabs__tab-link");  
             }
         });
     
         this.template.querySelectorAll(`[data-id="${event.currentTarget.dataset.id}"]`).forEach(element => {
             if(element.classList[0] === "ds_tabs__content--hidden") {
                 element.classList.remove("ds_tabs__content--hidden");
                 element.classList.add("ds_tabs__content"); 
             }
         });  
     }
     
 }