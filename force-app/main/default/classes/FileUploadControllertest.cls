@isTest
public class FileUploadControllertest {
	public static TestMethod void testScenario1(){
        Contact con = new Contact();
        con.LastName = 'Test';
        insert con;
        
         string before = 'test string';
        String jsonInput =  '[{\n' +
    ' "Title" :"Test",\n' +
    ' "VersionData" : "test String"\n' +
    '}]';
        List<Object> selectedRows = (List<Object>)JSON.deserializeUntyped(jsonInput);
        
        
        Test.startTest();
        FileUploadController.saveFiles(selectedRows,con.Id);
        Test.stopTest();
    }
}