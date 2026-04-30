import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import oncoLogo from '@salesforce/resourceUrl/OncoGlobalLogo';
import doctorIconRes from '@salesforce/resourceUrl/OncoDoctorIcon';
import scheduleIconRes from '@salesforce/resourceUrl/OncoScheduleIcon';
import engagementIconRes from '@salesforce/resourceUrl/OncoEngagementIcon';
import doctorImgRes from '@salesforce/resourceUrl/OncoDoctorImage';
import p1 from '@salesforce/resourceUrl/Patient1';
import p2 from '@salesforce/resourceUrl/Patient2';
import p3 from '@salesforce/resourceUrl/Patient3';

export default class OncoGlobalHomePage extends NavigationMixin(LightningElement) {
    // ===== LOGO =====
    healthLogoUrl = oncoLogo;

    // ===== FEATURES ICONS =====
    doctorIcon = doctorIconRes;
    careIcon = scheduleIconRes;
    supportIcon = engagementIconRes;

    // ===== ABOUT =====
    tickImg = '';
    doctorImage = doctorImgRes;
    // ===== TESTIMONIALS =====
    testimonials = [
    {
        name: 'Anita Verma',
        role: 'Cancer Survivor',
        text: 'Onco Global helped me find the right specialist without delays. The entire scheduling process was smooth and stress-free.',
        image: p1
    },
    {
        name: 'Rahul Mehta',
        role: 'Patient',
        text: 'Booking and managing appointments became effortless. The platform is extremely user-friendly.',
        image: p2
    },
    {
        name: 'Neha Kapoor',
        role: 'Caregiver',
        text: 'The reminders and scheduling support made managing treatment so much easier for our family.',
        image: p3
    }
    ];

    currentIndex = 0;

    get currentTestimonial() {
        return this.testimonials[this.currentIndex];
    }

    nextTestimonial() {
        this.currentIndex =
            (this.currentIndex + 1) % this.testimonials.length;
    }

    prevTestimonial() {
        this.currentIndex =
            (this.currentIndex - 1 + this.testimonials.length) %
            this.testimonials.length;
    }

    // ===== NAV =====
    isMobileMenuOpen = false;

    get navClass() {
        return this.isMobileMenuOpen ? 'navbar mobile-open' : 'navbar';
    }

    get menuIconName() {
        return this.isMobileMenuOpen ? 'utility:close' : 'utility:rows';
    }

    navigateToLogin() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/portalLogin'
            }
        });
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    closeMobileMenu() {
        this.isMobileMenuOpen = false;
    }

}