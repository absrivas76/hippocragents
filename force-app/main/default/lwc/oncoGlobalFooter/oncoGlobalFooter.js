import { LightningElement } from 'lwc';
import healthLogo from '@salesforce/resourceUrl/oncoGlobalLogo';

export default class PatientFooterComp extends LightningElement {
    healthLogoUrl = healthLogo;

    email = "";

    handleEmailChange(event) {

        this.email = event.target.value;

    }

    handleSubscribe() {

        if (!this.email) {

            alert("Please enter your email before subscribing.");

            return;

        }

        alert("Subscribed with: " + this.email);

    }

}