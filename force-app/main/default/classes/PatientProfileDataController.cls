public with sharing class PatientProfileDataController {

    @AuraEnabled(cacheable=true)
    public static Account getPatient(String accountId) {
        return [
            SELECT Name, PersonBirthdate, PersonEmail, PersonGender, Phone, BillingStreet, 
            BillingCity, BillingPostalCode, BillingState, BillingCountry, PersonMobilePhone
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<MedicationRequest> getMedications(String accountId) {
        return [
            SELECT Id, Status, Type, Priority, Medication.Name
            FROM MedicationRequest
            WHERE PatientId = :accountId
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<HealthCondition> getHealthConditions(String accountId) {
        return [
            SELECT 
                Id,
                ConditionStatus,
                ConditionCode.Name,
                PatientId
            FROM HealthCondition
            WHERE PatientId = :accountId
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<AllergyIntolerance> getAllergies(String accountId) {
        return [
            SELECT Id, Status, Type, VerificationStatus, Category, Severity, Code.Name
            FROM AllergyIntolerance
            WHERE PatientId = :accountId
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<ClinicalEncounter> getEncounters(String accountId) {
        return [
            SELECT Id, Status, Category, StartDate, EndDate
            FROM ClinicalEncounter
            WHERE PatientId = :accountId
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<PatientImmunization> getImmunizations(String accountId) {
        return [
            SELECT Id, Status, VaccinationDate, VaccineCode.Name
            FROM PatientImmunization
            WHERE PatientId = :accountId
        ];
    }
    
    // @AuraEnabled(cacheable=true)
    // public static List<CarePlan> getCarePlans(String accountId) {
    //     return [
    //         SELECT Id, Name, Status, Case.Subject, MedicationTherapyReview.ReviewType, MedicationTherapyReview.ReviewStartDateTime, MedicationTherapyReview.ReviewEndDateTime, ClinicalEncounter.Category, AuthorizationType
    //         FROM CarePlan
    //         WHERE ParticipantId = :accountId
    //     ];
    // }
    
    @AuraEnabled(cacheable=true)
    public static List<ServiceAppointment> getAppointments(String accountId) {
        return [
            SELECT Id, Subject, ServiceTerritory.Name, Status, EarliestStartTime, DueDate 
            FROM ServiceAppointment
            WHERE AccountId = :accountId
        ];
    }
    

    public class FileDetails {
        @AuraEnabled public String fileName;
        @AuraEnabled public String accountName;
        @AuraEnabled public Id documentId;
    }

    @AuraEnabled(cacheable=true)
    public static List<FileDetails> getFiles(String accountId) {
        List<FileDetails> results = new List<FileDetails>();
        List<ContentDocumentLink> links = [ SELECT ContentDocumentId, LinkedEntityId
        FROM ContentDocumentLink WHERE LinkedEntityId = :accountId];
        
            Set<Id> contentDocumentIds = new Set<Id>();
        
        for(ContentDocumentLink link : links) {
            contentDocumentIds.add(link.ContentDocumentId);
        }
        
        List<ContentDocument> documents = [
            SELECT Id, Title FROM ContentDocument WHERE Id IN :contentDocumentIds
        ];
        
        Map<Id, String> accountNames = new Map<Id, String>();
        
        for(ContentDocumentLink link : links) {
            accountNames.put(link.ContentDocumentId, [SELECT Name FROM Account WHERE Id = :link.LinkedEntityId].Name);
        }

        for(ContentDocument doc : documents) {
            FileDetails detail = new FileDetails();
            detail.fileName = doc.Title;
            detail.accountName = accountNames.get(doc.Id);
            detail.documentId = doc.Id;
            results.add(detail);
        }

        return results;
    }
}