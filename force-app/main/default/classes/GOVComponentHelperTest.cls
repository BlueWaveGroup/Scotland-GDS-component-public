@isTest
public class GOVComponentHelperTest {
	public static TestMethod void testScenario1(){
        
        
        Test.startTest();
        List<String> lststr = GovComponentHelper.getPicklistValuesByObjectField('Lead.Status');
        System.assertnotequals(0,lststr.size());
        Test.stopTest();
    }
    
    public static TestMethod void testScenario2(){
        
        
        Test.startTest();
        List<NavigationMenuItem> lststr = GovComponentHelper.getDefaultMenuItems('Test');
        Test.stopTest();
    }
}