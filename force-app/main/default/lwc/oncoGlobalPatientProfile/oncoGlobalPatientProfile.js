import { LightningElement } from 'lwc';
import oncoLogo from '@salesforce/resourceUrl/OncoGlobalLogo';
import getMedications from '@salesforce/apex/PatientProfileDataController.getMedications';
import getHealthConditions from '@salesforce/apex/PatientProfileDataController.getHealthConditions';
import getAllergies from '@salesforce/apex/PatientProfileDataController.getAllergies';
import getPatient from '@salesforce/apex/PatientProfileDataController.getPatient';
import { wire } from 'lwc';

export default class PatientProfilePage extends LightningElement {

    accountId = '001ak000026Q59HAAS'; 
    // ===== LOGO =====
    healthLogoUrl = oncoLogo;

    // ===== PATIENT DATA =====
    // patientName = "Rahul Mehta";
    // // patientId = "ONC-10234";
    // age = 42;
    // gender = "Male";

    medications = [];
    conditions = [];
    allergies = [];

    // ===== APPOINTMENTS =====
    appointments = [
        {
            id: 1,
            date: "12 Apr 2026",
            doctor: "Dr. Sharma",
            hospital: "Onco Global Mumbai"
        },
        {
            id: 2,
            date: "20 Apr 2026",
            doctor: "Dr. Iyer",
            hospital: "Onco Global Delhi"
        }
    ];

    searchTerm = '';

    get isMedications() {
        return this.activeCategory === 'medications';
    }

    get activeCategoryLabel() {
        switch (this.activeCategory) {
            case 'medications':
                return 'Medications';
            case 'conditions':
                return 'Health Conditions';
            case 'allergies':
                return 'Allergy Records';
            case 'encounters':
                return 'Encounters';
            case 'immunizations':
                return 'Immunizations';
            case 'careplans':
                return 'Care Plans';
            case 'reports':
                return 'Reports';
            default:
                return 'Medical Data';
        }
    }

    get filteredMedications() {
        const q = this.searchTerm;

        return this.medications.filter(m =>
            !q || `${m.name} ${m.type} ${m.priority}`.toLowerCase().includes(q)
        );
    }
    
    get isConditions() {
        return this.activeCategory === 'conditions';
    }

    get isAllergies() {
        return this.activeCategory === 'allergies';
    }

    get filteredConditions() {
        const q = this.searchTerm;

        return this.conditions.filter(c =>
            !q || `${c.name} ${c.severity}`.toLowerCase().includes(q)
        );
    }

    get filteredAllergies() {
        const q = this.searchTerm;

        return this.allergies.filter(a =>
            !q || `${a.name} ${a.severity}`.toLowerCase().includes(q)
        );
    }

    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
    }
    patientName = '';
    patientId = '';
    age = '';
    gender = '';

    @wire(getPatient, { accountId: '$accountId' })
    wiredPatient({ data, error }) {
        if (data) {
            // console.log('Patient data:', data);

            this.patientName = data.Name;
            // this.patientId = data.Id;
            this.gender = data.PersonGender || 'N/A';

            if (data.PersonBirthdate) {
                const birthDate = new Date(data.PersonBirthdate);
                const ageDifMs = Date.now() - birthDate.getTime();
                const ageDate = new Date(ageDifMs);
                this.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            } else {
                this.age = 'N/A';
            }

        } else if (error) {
            console.error('Patient error', error);
        }
    }

    @wire(getMedications, { accountId: '$accountId' })
    wiredMedications({ data, error }) {
        if (data) {
            try {

                console.log('Medications data:', data);

                this.medications = data.map(item => ({
                    id: item.Id,
                    name: item.Medication && item.Medication.Name 
                        ? item.Medication.Name 
                        : 'Unknown Medication',
                    status: item.Status || 'Active',
                    type: item.Type || 'N/A',
                    priority: item.Priority || 'Normal',
                    priorityClass: this.getPriorityClass(item.Priority)
                }));

            } catch (e) {
                console.error('Mapping error:', e);
            }

        } else if (error) {
            console.error('Medications error', error);
        }
    }

    @wire(getHealthConditions, { accountId: '$accountId' })
    wiredConditions({ data, error }) {
        if (data) {

            console.log('Conditions data:', data);

            this.conditions = data.map(item => ({
                id: item.Id,
                name: item.ConditionCode ? item.ConditionCode.Name : 'Unknown Condition',
                severity: item.ConditionStatus || 'N/A'
            }));

        } else if (error) {
            console.error('Conditions error', error);
        }
    }

    @wire(getAllergies, { accountId: '$accountId' })
    wiredAllergies({ data, error }) {
        if (data) {
            console.log('Allergies data:', data);
            
            this.allergies = data.map(item => ({
                id: item.Id,
                name: item.Code ? item.Code.Name : 'Unknown Allergy'
            }));

        } else if (error) {
            console.error('Allergies error', error);
        }
    }

    getPriorityClass(priority) {
        if (!priority) return 'priority-normal';

            const p = priority.toLowerCase();

            if (p.includes('urgent')) return 'priority-urgent';
            if (p.includes('high')) return 'priority-high';

            return 'priority-normal';
        }


    // ===== MEDICAL CATEGORY STATE =====
    activeCategory = 'medications';

    // ===== TILE SELECTION METHODS =====
    selectMedications() {
        this.activeCategory = 'medications';
    }

    selectConditions() {
        this.activeCategory = 'conditions';
    }

    selectAllergies() {
        this.activeCategory = 'allergies';
    }

    selectEncounters() {
        this.activeCategory = 'encounters';
    }

    selectImmunizations() {
        this.activeCategory = 'immunizations';
    }

    // selectCarePlans() {
    //     this.activeCategory = 'careplans';
    // }

    selectReports() {
        this.activeCategory = 'reports';
    }

    // ===== TILE ACTIVE CLASSES =====
    get medicationsTileClass() {
        return `tile ${this.activeCategory === 'medications' ? 'active' : ''}`;
    }

    get conditionsTileClass() {
        return `tile ${this.activeCategory === 'conditions' ? 'active' : ''}`;
    }

    get allergiesTileClass() {
        return `tile ${this.activeCategory === 'allergies' ? 'active' : ''}`;
    }

    get encountersTileClass() {
        return `tile ${this.activeCategory === 'encounters' ? 'active' : ''}`;
    }

    get immunizationsTileClass() {
        return `tile ${this.activeCategory === 'immunizations' ? 'active' : ''}`;
    }

    get careplansTileClass() {
        return `tile ${this.activeCategory === 'careplans' ? 'active' : ''}`;
    }

    get reportsTileClass() {
        return `tile ${this.activeCategory === 'reports' ? 'active' : ''}`;
    }

    // ===== SCROLL FUNCTIONS =====
    scrollLeft() {
        const container = this.template.querySelector('[data-id="tilesContainer"]');
        if (container) {
            container.scrollLeft -= 200;
        }
    }

    scrollRight() {
        const container = this.template.querySelector('[data-id="tilesContainer"]');
        if (container) {
            container.scrollLeft += 200;
        }
    }

}