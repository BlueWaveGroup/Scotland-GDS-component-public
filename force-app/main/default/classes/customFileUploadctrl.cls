//created by Bluewave
//Controller for the file upload Component

public without sharing class customFileUploadctrl {
    @AuraEnabled
    public static List<file> getRelatedFiles(String recordId, String sectionType, String screen){
        List<File> files = new List<File>();
        system.debug('screen value is' + screen);
        if(screen == null){
            screen = 'default';
        }

        //retrieve contentDocumentLIst
        List<ContentDocumentLink> contentDocumentList = getContentDocumentList(recordId);
        system.debug('contentDocumentList' + contentDocumentList);

        //setdocumentId
        Set<Id> contentDocumentIdSet = getContentDocumentIdSet(contentDocumentList);

        //retrieve the contentversion for the specific sectionType
        Set<Id> contentDocumentForSectionIdSet = getContentDocumentForSectionIdSet(contentDocumentIdSet,sectionType, screen);
        system.debug('contentDocumentForSectionIdSet' + contentDocumentForSectionIdSet);

        for(ContentDocumentLink conLink : contentDocumentList){
            if(contentDocumentForSectionIdSet.contains(conLink.ContentDocumentId)){
                File file = new File();
                file.Title = conLink.ContentDocument.Title;
                file.Id = conLink.ContentDocument.Id;
                file.CreatedDate = conLink.ContentDocument.CreatedDate;
                file.Type = conLink.ContentDocument.FileType;
                file.Description = conLink.ContentDocument.Description;
                files.add(file);

            }
        }            
        
        return files;
    }

    @AuraEnabled
    public static boolean deleteFile(string fileId){
        system.debug('deleteion' + fileId);
        Boolean result= false;
        try {
        ContentDocument fileToDelete = [SELECT Id FROM ContentDocument WHERE id=: id.valueOf(fileId)];
        delete fileToDelete;

        result= true;
        return result;
            
        } catch (Exception e) {
            return result;
        }
    }

    @AuraEnabled
    public static boolean updateType(List<string> documentArray, string sectionType, string screen){
        system.debug('in the updatetype@@' + sectionType);
        system.debug('screen' + screen);
        if(screen == null){
            screen = 'default';
        }
        List<contentversion> contentVersionList = new List<contentversion>();
        Set<Id> contentDocumentSetId = new Set<Id>();

        /*for(string documentDetails : documentArray){
            contentversion contentVersionItem = new contentversion();
            contentVersionItem.contentDocumentId = Id.valueOf(documentDetails);
            contentVersionItem.Type_fileupload__c = sectionType;
            contentVersionList.add(contentVersionItem);            
        }*/

        for(string documentDetails : documentArray){
            contentDocumentSetId.add(Id.valueOf(documentDetails));
        }
       

        for(contentversion contentversionItem : [SELECT Id, Type__c
                                                    FROM contentversion
                                                    WHERE contentDocumentId=:contentDocumentSetId]){
            contentversion contentVersionRec = new contentversion();
            contentVersionRec.Id = contentversionItem.Id;
            contentVersionRec.Type__c = sectionType;
            contentVersionRec.screen__c = screen;
            contentVersionList.add(contentVersionRec);                                             
        }

        system.debug('contentVersionLis' + contentVersionList);
        update contentVersionList;
        return true;

    }

    private static List<ContentDocumentLink> getContentDocumentList(String recordId){
        List<ContentDocumentLink> contentDocumentList = new List<ContentDocumentLink>();

        return [SELECT ContentDocument.Id, 
                        ContentDocumentId,
                                ContentDocument.Title, 
                                ContentDocument.CreatedDate, 
                                ContentDocument.FileType,
                                ContentDocument.Description
                                    FROM ContentDocumentLink                                     
                                   WHERE LinkedEntityId =: recordId] ;
    }

    private static set<Id> getContentDocumentIdSet(List<ContentDocumentLink> listContentDocumentLinkId){
        set<Id> contentDocumentSetId = new set<Id>();
        for(ContentDocumentLink contentDocItem: listContentDocumentLinkId){
            contentDocumentSetId.add(contentDocItem.ContentDocumentID);
        }
        return contentDocumentSetId;
    }


    private static Set<Id> getContentDocumentForSectionIdSet(Set<Id> contentDocumentSet, String sectionType, String screen){
        Set<Id> contentDocumentForSectionIdSet = new Set<Id>();

        for(ContentVersion conLink : [SELECT ContentDocumentId 
                                                    FROM ContentVersion                                            
                                                    WHERE ContentDocumentId =: contentDocumentSet 
                                                    AND Type__c =: sectionType
                                                    AND screen__C =: screen] ){

            contentDocumentForSectionIdSet.add(conLink.ContentDocumentId); }

        return contentDocumentForSectionIdSet;    
    }



    @AuraEnabled
    public static boolean updateFile(string documentId, string sectionType, string screen, string description, string recordId){
        system.debug('in the updatetype@@' + sectionType);
        system.debug('screen' + screen);
        List<contentversion> contentVersionList = new List<contentversion>();
        
        if(screen == null){
            screen = 'default';
        }        
        


        for(contentversion contentversionItem : [SELECT Id, Type__c
                                                    FROM contentversion
                                                    WHERE contentDocumentId=:documentId]){
            contentversion contentVersionRec = new contentversion();
            contentVersionRec.Id = contentversionItem.Id;
            contentVersionRec.Type__c = sectionType;
            contentVersionRec.screen__c = screen;
            contentVersionRec.description = description;
            contentVersionList.add(contentVersionRec);                                             
        }

        system.debug('contentVersionLis' + contentVersionList);
        update contentVersionList;

        

        
        //create new link so we can assign the file to the correct record
        //the upload component doesnt due to Salesforce restrictions wih community user access to filesContentDocumentLink cdl = createContentLink(cv.Id, recordId);
        if(!test.isRunningTest()){
            ContentDocumentLink cdl = createContentLink(documentId, recordId);
        }

        
        return true;

        

    }


    
  
     /*
     * @method createContentLink() [private]
     * @desc Creates a content link for a given ContentVersion and record
     * 
     * @param {String} contentVersionId - Id of the ContentVersion of the file
     * @param {String} recordId - Id of the record you want to attach this file to
     * 
     * @return {ContentDocumentLink} - returns the newly created ContentDocumentLink, 
     *   or null if there was an error inserting the record
     */
    private static ContentDocumentLink createContentLink(String contentDocumentId, String recordId) {
    if (contentDocumentId == null || recordId == null) { return null; }
      ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.contentDocumentId = contentDocumentId;
            cdl.LinkedEntityId = recordId;
                    // ShareType is either 'V', 'C', or 'I'
                    // V = Viewer, C = Collaborator, I = Inferred
            cdl.ShareType = 'V';
      try {
                insert cdl;
                return cdl;
      } catch(DMLException e) {
                System.debug(e);
                return null;
      }
    }

   


    public class File{
        @AuraEnabled public String Title;
        @AuraEnabled public String Type;
        @AuraEnabled public Id Id;
        @AuraEnabled public Datetime CreatedDate;
        @AuraEnabled public String Description;
    }
}