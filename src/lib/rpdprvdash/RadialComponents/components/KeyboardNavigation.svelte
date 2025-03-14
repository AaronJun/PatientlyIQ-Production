<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import { processDataForLayout } from '../../utils/data-processing-utils';

    // Props
    export let focusableElements: any[] = [];
    export let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let data: any[] = [];
    export let setActiveCompany: (company: string, entries: any[]) => void;
    
    // Local state
    let currentFocusIndex = -1;
    
    /**
     * Sets up keyboard navigation for the visualization
     */
    export function setupKeyboardNavigation() {
        if (!contentGroup) return;
        
        // Add keyboard handler for SVG container for accessibility
        contentGroup.attr("tabindex", "0")
            .attr("role", "application")
            .attr("aria-label", "Company and drug visualization")
            .on("keydown", (event) => {
                // When Tab is pressed in the SVG container, focus the first company label
                if (event.key === "Tab" && !event.shiftKey && focusableElements.length > 0) {
                    event.preventDefault();
                    // Use HTMLElement focus method on the element
                    (focusableElements[0].element as HTMLElement).focus();
                    currentFocusIndex = 0;
                }
                
                // Add arrow key navigation between company labels
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    event.preventDefault();
                    navigateToNextCompany();
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    event.preventDefault();
                    navigateToPreviousCompany();
                }
            });
            
        // Add global keyboard event listener for arrow navigation between companies
        document.addEventListener('keydown', handleGlobalKeydown);
    }
    
    // Function to handle global keyboard navigation
    function handleGlobalKeydown(event: KeyboardEvent) {
        // Only handle arrow keys when a company label is focused
        if (currentFocusIndex >= 0 && (
            event.key === "ArrowRight" || 
            event.key === "ArrowDown" || 
            event.key === "ArrowLeft" || 
            event.key === "ArrowUp"
        )) {
            event.preventDefault();
            
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                navigateToNextCompany();
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                navigateToPreviousCompany();
            }
        }
    }
    
    // Function to navigate to the next company
    export function navigateToNextCompany() {
        if (focusableElements.length === 0) return;
        
        // Find companies (not drugs)
        const companyElements = focusableElements.filter(el => el.type === 'company');
        if (companyElements.length === 0) return;
        
        // Find current index or start at beginning
        let currentIndex = companyElements.findIndex(el => 
            document.activeElement === el.element
        );
        
        // Move to next company or wrap around
        currentIndex = (currentIndex < 0) ? 0 : (currentIndex + 1) % companyElements.length;
        
        // Focus the next company
        (companyElements[currentIndex].element as HTMLElement).focus();
        currentFocusIndex = focusableElements.indexOf(companyElements[currentIndex]);
        
        // Also update the active company to ensure sidebar data is updated
        const company = companyElements[currentIndex].company;
        if (company) {
            const companyData = processDataForLayout(data).find(c => c.company === company);
            if (companyData) {
                setActiveCompany(company, companyData.entries);
            }
        }
    }
    
    // Function to navigate to the previous company
    export function navigateToPreviousCompany() {
        if (focusableElements.length === 0) return;
        
        // Find companies (not drugs)
        const companyElements = focusableElements.filter(el => el.type === 'company');
        if (companyElements.length === 0) return;
        
        // Find current index or start at end
        let currentIndex = companyElements.findIndex(el => 
            document.activeElement === el.element
        );
        
        // Move to previous company or wrap around
        currentIndex = (currentIndex < 0) ? companyElements.length - 1 : 
                      (currentIndex - 1 + companyElements.length) % companyElements.length;
        
        // Focus the previous company
        (companyElements[currentIndex].element as HTMLElement).focus();
        currentFocusIndex = focusableElements.indexOf(companyElements[currentIndex]);
        
        // Also update the active company to ensure sidebar data is updated
        const company = companyElements[currentIndex].company;
        if (company) {
            const companyData = processDataForLayout(data).find(c => c.company === company);
            if (companyData) {
                setActiveCompany(company, companyData.entries);
            }
        }
    }
    
    // Function to navigate to the next drug within the same company
    export function navigateToNextDrug(companyName: string, currentDrugId: string) {
        // Find the company reference
        const companyRef = focusableElements.find(item => 
            item.type === 'company' && item.company === companyName
        );
        
        if (!companyRef || !companyRef.drugNodes || companyRef.drugNodes.length === 0) return;
        
        // Find the current drug index
        const currentIndex = companyRef.drugNodes.findIndex((drugRef: any) => 
            drugRef.element.id === currentDrugId
        );
        
        if (currentIndex < 0) return;
        
        // Calculate next index with wrap-around
        const nextIndex = (currentIndex + 1) % companyRef.drugNodes.length;
        
        // Focus the next drug
        (companyRef.drugNodes[nextIndex].element as HTMLElement).focus();
        
        // The focus event handler will update the sidebar data
    }
    
    // Function to navigate to the previous drug within the same company
    export function navigateToPreviousDrug(companyName: string, currentDrugId: string) {
        // Find the company reference
        const companyRef = focusableElements.find(item => 
            item.type === 'company' && item.company === companyName
        );
        
        if (!companyRef || !companyRef.drugNodes || companyRef.drugNodes.length === 0) return;
        
        // Find the current drug index
        const currentIndex = companyRef.drugNodes.findIndex((drugRef: any) => 
            drugRef.element.id === currentDrugId
        );
        
        if (currentIndex < 0) return;
        
        // Calculate previous index with wrap-around
        const prevIndex = (currentIndex - 1 + companyRef.drugNodes.length) % companyRef.drugNodes.length;
        
        // Focus the previous drug
        (companyRef.drugNodes[prevIndex].element as HTMLElement).focus();
        
        // The focus event handler will update the sidebar data
    }
    
    // Clean up event listeners when component is destroyed
    onDestroy(() => {
        document.removeEventListener('keydown', handleGlobalKeydown);
    });
</script> 