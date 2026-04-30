public with sharing class RegistrationFormController {

    @AuraEnabled
    public static String registerPatient(
        String firstName,
        String lastName,
        String regEmail,
        String phone,
        Date dob
    ) {
        try {
            
            String uniqueUsername = regEmail;
            //  Check if email already exists
           
            Integer existingUsers = [SELECT COUNT() FROM User WHERE Username = :regEmail];
            
            if (existingUsers > 0) {
                throw new AuraHandledException('Email already registered. Please login.');
            }
            
            RecordType rectype = [Select Id, Name, DeveloperName from RecordType where sObjectType='Account' AND DeveloperName = 'PersonAccount' Limit 1];
           
            List<Account> existingAcc = [
                SELECT Id FROM Account 
                WHERE PersonEmail = :regEmail 
                LIMIT 1
            ];

            if (!existingAcc.isEmpty()) {
                throw new AuraHandledException('Account already exists. Please login.');
            }
            //  Create Person Account
            Account patient = new Account(
                FirstName = firstName,
                LastName = lastName,
                PersonEmail = regEmail,
                Phone = phone,
                PersonBirthdate = dob,
                RecordTypeId = rectype.Id
            );

            insert patient;

            //  Get Contact associated with Person Account
            // Contact patientContact = [
            //     SELECT Id 
            //     FROM Contact 
            //     WHERE AccountId = :patient.Id 
            //     LIMIT 1
            // ];

            //  Get Community Profile
            // Profile communityProfile = [
            //     SELECT Id 
            //     FROM Profile 
            //     WHERE Name='Customer Community Plus User' 
            //     LIMIT 1
            // ];

            Profile communityProfile = [
                SELECT Id 
                FROM Profile 
                WHERE Name = 'Standard User'
                LIMIT 1
            ];

            //  Create User
            String alias = (firstName.length() >= 2 ? firstName.substring(0,2) : firstName) +
                           (lastName.length() >= 2 ? lastName.substring(0,2) : lastName);

            User patientUser = new User(
                Username = uniqueUsername,
                Email = regEmail,
                FirstName = firstName,
                LastName = lastName,
                Alias = alias,
                TimeZoneSidKey = 'America/Los_Angeles',
                LocaleSidKey = 'en_US',
                EmailEncodingKey = 'UTF-8',
                LanguageLocaleKey = 'en_US',
                ProfileId = communityProfile.Id,
                // ContactId = patientContact.Id,
                IsActive = true
            );
            insert patientUser;

            String tempPassword = 'Test@1234'; // or pass from UI

            System.setPassword(patientUser.Id, tempPassword);

           // Send Set Password / Welcome email
            if (!Test.isRunningTest()) {
               // System.resetPassword(patientUser.Id, true); // This triggers the email
            }


            return 'SUCCESS';

        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    // =============================
    //  PATIENT LOGIN LOGIC
    // =============================
    @AuraEnabled
    public static String loginPatient(String username, String password) {
        try {
            // 1. Check user exists
            User loggedUser = [
                SELECT Id 
                FROM User 
                WHERE Username = :username 
                LIMIT 1
            ];

            // 2. Fetch corresponding Account
            Account acc = [
                SELECT Id 
                FROM Account 
                WHERE PersonEmail = :username 
                LIMIT 1
            ];

            return '/s/profile?accountId=' + acc.Id;

        } catch (Exception e) {
            return 'ERROR';
        }
    }

     // =============================
    // Forgot Password Logic
    // =============================
   @AuraEnabled
    public static String forgotPassword(String email) {
    System.debug('ForgotPassword called with email: ' + email);
    
    try {
        List<User> users = [SELECT Id FROM User WHERE Username = :email LIMIT 1];
        System.debug('Users found: ' + users.size());

        if (users.isEmpty()) {
            System.debug('Email not found in system: ' + email);
            return 'NOT_FOUND';
        }

        System.debug('Sending password reset email to userId: ' + users[0].Id);

        System.setPassword(users[0].Id, 'Test@1234'); 

        System.debug('Password reset successfully.');
        return 'RESET_TO_DEFAULT';

    } catch (Exception e) {
        System.debug('Error in forgotPassword: ' + e.getMessage());
        return 'ERROR';
    }
}

}