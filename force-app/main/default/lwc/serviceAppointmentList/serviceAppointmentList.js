import { LightningElement, api, wire } from 'lwc';
import { gql, graphql } from 'lightning/uiGraphQLApi';

const COLUMNS = [
    {
        label: 'Patient Name',
        fieldName: 'accountUrl',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'accountName' },
            target: '_blank'
        },
        cellAttributes: {
            class: 'slds-text-link'
        }
    },
    {
        label: 'Hospital Name',
        fieldName: 'serviceTerritoryName',
        type: 'text'
    },
    {
        label: 'Scheduled Date',
        fieldName: 'SchedStartTime',
        type: 'date',
        typeAttributes: {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        }
    }
];

export default class ServiceAppointmentList extends LightningElement {
    @api recordId;
    columns = COLUMNS;
    serviceAppointments = [];
    error;
    isLoading = true;

    noShowCount = 0;
    completedCount = 0;
    noShowDataLoaded = false;
    completedDataLoaded = false;

    get variables() {
        return { serviceResourceId: this.recordId };
    }

    get query() {
        if (!this.recordId) return undefined;
        return gql`
            query getServiceAppointments($serviceResourceId: ID!) {
                uiapi {
                    query {
                        ServiceAppointment(
                            where: {
                                and: [
                                    { FSSK__FSK_Assigned_Service_Resource__c: { eq: $serviceResourceId } }
                                    { Predicted_Status__c: { eq: "No Show" } }
                                    { Status: { eq: "Scheduled" } }
                                ]
                            }
                            orderBy: { SchedStartTime: { order: ASC } }
                            first: 200
                        ) {
                            edges {
                                node {
                                    Id
                                    AccountId { value }
                                    Account {
                                        Name { value }
                                    }
                                    ServiceTerritory {
                                        Name { value }
                                    }
                                    SchedStartTime { value }
                                }
                            }
                        }
                    }
                }
            }
        `;
    }

    @wire(graphql, { query: '$query', variables: '$variables' })
    wiredResult({ error, data }) {
        if (data) {
            const edges = data.uiapi.query.ServiceAppointment.edges;
            this.serviceAppointments = edges.map(edge => ({
                Id: edge.node.Id,
                accountName: edge.node.Account?.Name?.value || 'N/A',
                accountUrl: edge.node.AccountId?.value ? '/' + edge.node.AccountId.value : '',
                serviceTerritoryName: edge.node.ServiceTerritory?.Name?.value || 'N/A',
                SchedStartTime: edge.node.SchedStartTime?.value
            }));
            this.noShowCount = edges.length;
            this.error = undefined;
        } else if (error) {
            this.error = error?.body?.message || JSON.stringify(error);
            this.serviceAppointments = [];
            this.noShowCount = 0;
        }
        this.noShowDataLoaded = true;
        this.checkLoading();
    }

    get completedVariables() {
        return { serviceResourceId: this.recordId };
    }

    get completedQuery() {
        if (!this.recordId) return undefined;
        return gql`
            query getCompletedAppointments($serviceResourceId: ID!) {
                uiapi {
                    query {
                        ServiceAppointment(
                            where: {
                                and: [
                                    { FSSK__FSK_Assigned_Service_Resource__c: { eq: $serviceResourceId } }
                                    { Predicted_Status__c: { eq: "Completed" } }
                                    { Status: { eq: "Scheduled" } }
                                ]
                            }
                            first: 200
                        ) {
                            edges {
                                node {
                                    Id
                                }
                            }
                        }
                    }
                }
            }
        `;
    }

    @wire(graphql, { query: '$completedQuery', variables: '$completedVariables' })
    wiredCompleted({ error, data }) {
        if (data) {
            this.completedCount = data.uiapi.query.ServiceAppointment.edges.length;
        } else if (error) {
            this.completedCount = 0;
        }
        this.completedDataLoaded = true;
        this.checkLoading();
    }

    checkLoading() {
        if (this.noShowDataLoaded && this.completedDataLoaded) {
            this.isLoading = false;
        }
    }

    get totalCount() {
        return this.noShowCount + this.completedCount;
    }

    get noShowPercentage() {
        return this.totalCount > 0 ? Math.round((this.noShowCount / this.totalCount) * 100) : 0;
    }

    get completedPercentage() {
        return this.totalCount > 0 ? Math.round((this.completedCount / this.totalCount) * 100) : 0;
    }

    get hasChartData() {
        return this.totalCount > 0;
    }

    get hasRecords() {
        return this.serviceAppointments?.length > 0;
    }

    get recordCount() {
        return this.serviceAppointments?.length || 0;
    }

    get circumference() {
        return 2 * Math.PI * 70;
    }

    get noShowDash() {
        const value = this.totalCount > 0
            ? (this.noShowCount / this.totalCount) * this.circumference
            : 0;
        return `${value} ${this.circumference}`;
    }

    get completedDash() {
        const value = this.totalCount > 0
            ? (this.completedCount / this.totalCount) * this.circumference
            : 0;
        return `${value} ${this.circumference}`;
    }

    get completedOffset() {
        const noShowArc = this.totalCount > 0
            ? (this.noShowCount / this.totalCount) * this.circumference
            : 0;
        return -noShowArc;
    }

    get noShowBarStyle() {
        return `width: ${this.noShowPercentage}%`;
    }

    get completedBarStyle() {
        return `width: ${this.completedPercentage}%`;
    }
}