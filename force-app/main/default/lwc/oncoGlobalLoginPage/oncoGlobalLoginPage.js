import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import registerPatient from '@salesforce/apex/RegistrationFormController.registerPatient';
import loginPatientApex from '@salesforce/apex/RegistrationFormController.loginPatient';
import forgotPasswordApex from '@salesforce/apex/RegistrationFormController.forgotPassword';
import oncoLogo from '@salesforce/resourceUrl/OncoGlobalLogo';
import BG_IMAGE from '@salesforce/resourceUrl/OncoAuthBG';
import tickmark from '@salesforce/resourceUrl/OncoTick';

export default class AuthPage extends LightningElement {
    
    tickImg = tickmark;
    logoUrl = oncoLogo;
    @track activeTab = 'login';

   
    @track loginEmail = '';
    @track loginPassword = '';

    handleLoginEmail(e) { this.loginEmail = e.target.value; }
    handleLoginPassword(e) { this.loginPassword = e.target.value; }

    submitLogin() {
        if (!this.loginEmail || !this.loginPassword) {
            return this.toast('Error', 'Please fill in all fields', 'error');
        }

        loginPatientApex({
            username: this.loginEmail,
            password: this.loginPassword
        })
        .then(result => {
            if (result && result !== 'ERROR') {
                this.toast('Success', 'Login successful! Redirecting...', 'success');
                window.location.href = result;
            } else {
                this.toast('Error', 'Invalid email or password', 'error');
            }
        })
        .catch(() => this.toast('Error', 'Login failed. Try again.', 'error'));
    }

    // REGISTRATION DATA
    @track regData = {
        firstName: '',
        lastName: '',
        regEmail: '',
        phone: '',
        dob: '',
        nhi: '',
        regPassword: ''
    };

    handleInput(e) { this.regData[e.target.name] = e.target.value; }
    handleInputUpper(e) { this.regData[e.target.name] = e.target.value.toUpperCase(); }

    errorMessage = '';
    successMessage = '';

    submitRegister() {

        console.log('Register clicked', this.regData);
        const d = this.regData;

        if (!d.firstName || !d.lastName || !d.regEmail || !d.phone || !d.dob) {
            return this.toast('Error', 'Please fill in all required fields', 'error');
        }

        console.log('Calling Apex now...');

        registerPatient({
            firstName: d.firstName,
            lastName: d.lastName,
            regEmail: d.regEmail,
            phone: d.phone,
            dob: d.dob
        })
        .then(result => {
            if (result === 'SUCCESS') {
                this.successMessage = 'Registration successful! Please log in.';
                this.errorMessage = '';

                this.regData = { firstName: '', lastName: '', regEmail: '', phone: '', dob: '' };

                setTimeout(() => { this.activeTab = 'login'; }, 50);
            }
        })
        .catch(error => {
            let msg = error?.body?.message || 'Something went wrong';
            console.error(msg);

            this.errorMessage = msg;
            this.successMessage = '';
        });
    }

   
    toast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    // FORGOT PASSWORD
    @track showForgotModal = false;
    @track forgotEmail = '';

    forgotPassword() {
        this.forgotEmail = '';
        this.showForgotModal = true;
    }

    closeForgotModal() {
        this.showForgotModal = false;
    }

    handleForgotEmail(e) {
        this.forgotEmail = e.target.value;
    }

    submitForgot() {
        if (!this.forgotEmail) {
            return this.toast('Error', 'Please enter your email', 'error');
        }

        forgotPasswordApex({ email: this.forgotEmail })
            .then(result => {
                if (result === 'SUCCESS') {
                    this.toast(
                        'Success',
                        'A password reset link has been sent to your email.',
                        'success'
                    );
                    this.showForgotModal = false;
                } else if (result === 'NOT_FOUND') {
                    this.toast(
                        'Error',
                        'The email you entered is not registered in our system.',
                        'error'
                    );
                } else {
                    this.toast(
                        'Error',
                        'Unable to process request. Please try again later.',
                        'error'
                    );
                }
            })
            .catch(() => {
                this.toast(
                    'Error',
                    'Unable to process request. Please try again later.',
                    'error'
                );
            });
    }

    supportInfo() {
        this.toast('Info', 'Contact: 04 385 5999 or patient.portal@adhb.govt.nz', 'info');
    }


    get bgStyle() {
    return `
        background-image: url(${BG_IMAGE});
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    `;
    }

}