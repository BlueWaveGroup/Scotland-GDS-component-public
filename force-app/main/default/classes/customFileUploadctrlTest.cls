@isTest
public class customFileUploadctrlTest {

    @testSetup static void setup(){
        List<String> newStr = new List<String>();
       
       string before = 'Testing base 64 encode';            
         Blob beforeblob = Blob.valueOf(before); 
        
       
        contentversion rec = new contentversion();
        rec.Title = 'Test';
        rec.screen__c = 'Screen';
        rec.PathOnClient = 'PathTest';
        rec.VersionData = beforeblob;
        rec.Description = 'test description';
        rec.Type__c = 'Invoices';
        
        insert rec;
        
        Account testAccount = new Account();
		testAccount.Name='Test Account' ;
		insert testAccount;
        
        
		ContentDocument cddoc = new ContentDocument(); 

        ContentDocumentLink contentDocumentList = new ContentDocumentLink();
        contentDocumentList.LinkedEntityId = testAccount.Id;
        contentDocumentList.ShareType = 'V';
        contentDocumentList.ContentDocumentId = [select contentdocumentid from contentversion where id =: rec.id].contentdocumentid;
        contentDocumentList.LinkedEntityId = testAccount.Id;
        
        insert contentDocumentList;
    }
    
    public static TestMethod void getRelatedFile_testScenario1(){
       List<Account> acclst = [Select id from Account LIMIT 1];
        
        Test.startTest();
            List<customFileUploadctrl.File> fileList = customFileUploadctrl.getRelatedFiles(acclst[0].Id,'Invoices','Screen');
        Test.stopTest();

        system.assertEquals(1, fileList.size());
        system.assertEquals('Test', fileList[0].Title);
        
    }
    
    public static TestMethod void UpdateType_testScenario2(){
       List<contentversion> converlst = [SELECT Id, Type__c, contentdocumentid FROM contentversion LIMIT 1];
       List<String> recId = new List<String>();
        recId.add(converlst[0].Id);
        recId.add(converlst[0].contentdocumentid);
        Test.startTest();
        	customFileUploadctrl.updateType(recId, '','Screen');
        Test.stopTest();
        
    }

    public static TestMethod void deleteFile_testScenario3(){
        List<contentversion> converlst = [SELECT Id, Type__c, contentdocumentid FROM contentversion LIMIT 1];
       
         Test.startTest();
             customFileUploadctrl.deleteFile(converlst[0].Id);
         Test.stopTest();

         List<contentversion> converlstFinal = [SELECT Id, Type__c, contentdocumentid FROM contentversion LIMIT 1];
         system.assertEquals(1, converlstFinal.size());
         
     }

     public static TestMethod void uploadFile_PDF_testScenario4(){
        
        //arrange
        account acc = [SELECT Id FROM Account LIMIT 1];
        string documentid= [select contentdocumentid from contentversion].contentdocumentid;
        
       
         Test.startTest();
             Boolean fileresult = customFileUploadctrl.updateFile(documentId, 'Invoices','Invoices', 'This is an invoice', acc.id);            
         Test.stopTest();

        
         system.assertEquals(true, fileresult);
         
     }

    
     


     
}