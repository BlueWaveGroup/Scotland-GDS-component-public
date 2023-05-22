/**
 * Component Name: Gov UK Page Header
 * Derived_From_Frontend_Version:v3.13.1
 * Created by: Bluewave
 **/
import { LightningElement,api } from 'lwc';

export default class GovPageHeader extends LightningElement {
     @api Pagelabel;
     @api PageTitle;
     @api MetaKey;
     @api MetaValue;


}