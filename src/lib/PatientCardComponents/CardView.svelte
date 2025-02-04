<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import "carbon-components-svelte/css/all.css";
  import { Content, Grid, Row, Column } from "carbon-components-svelte";
  import ContentPreview from './CardPreview.svelte';
  import QuoteSidebar from './CardSidebar.svelte';
  import FilterComponent from './CardFilter.svelte';
  import PatientDrawer from './PatientDrawer.svelte';
  import { selectedQuote, selectedPatient, selectedImage } from './patientCardStore';
  import participants from './patientCardData.json';

  let filteredParticipants = participants;
  let isDrawerOpen = false;
  let currentPatientIndex = 0;

  function handleFilter(event: { detail: { persona: any; ageRange: any; }; }) {
    const { persona, ageRange } = event.detail;
    
    filteredParticipants = participants.filter(p => {
      let matchPersona = persona === 'all' || persona === null || p.persona.toLowerCase() === persona;
      let matchAge = ageRange === 'all' || ageRange === null || matchAgeRange(parseAge(p.age), ageRange);
      return matchPersona && matchAge;
    });
  }

  function matchAgeRange(age: number, range: string) {
    if (range === '18-30') return age >= 18 && age <= 30;
    if (range === '31-50') return age >= 31 && age <= 50;
    if (range === '51-70') return age >= 51 && age <= 70;
    if (range === '71+') return age >= 71;
    return true;
  }

  function parseAge(ageString: string) {
    if (ageString.includes('-')) {
      return parseInt(ageString.split('-')[1]);
    } else {
      return parseInt(ageString);
    }
  }

  function handlePatientSelect(patient: { id: any; name?: string; disease?: string; persona?: string; age?: string; summary?:
    string; quote?: string; "trial-sentiment"?: string; "treatment-sentiment"?: string; "medical-literacy"?: string; "financial-stability"?: string; photoUrl?: string; } | null) {
    currentPatientIndex = filteredParticipants.findIndex(p => p.id === patient.id);
    selectedPatient.set(patient);
        isDrawerOpen = true;
  }

  function closeDrawer() {
    isDrawerOpen = false;
  }

  function handleQuoteChange(patient) {
    if (patient) {
      console.log('Updating patient data:', patient);
      selectedQuote.set(patient.quote);
      selectedPatient.set(patient);
      selectedImage.set(patient.photoUrl);
    } else {
      selectedQuote.set('');
      selectedPatient.set(null);
      selectedImage.set('');
    }
  }

  function handleMouseLeave() {
    selectedQuote.set('');
    selectedPatient.set(null);
    selectedImage.set('');
  }
  function handleDrawerNavigation(index: number) {
    currentPatientIndex = index;
    selectedPatient.set(filteredParticipants[index]);
  }
</script>

<Content>
<Grid>
  <Row>
    <Column lg={16}>
      <FilterComponent on:filter={handleFilter} />
    </Column>
  </Row>
  <Row>
    <Column lg={6}>
      <QuoteSidebar />
    </Column>

    <Column lg={10}>
      {#each filteredParticipants as participant, index}
        <div 
          on:click={() => handlePatientSelect(participant)}
          on:mouseenter={() => handleQuoteChange(participant)}
        >
          <ContentPreview {...participant} />
        </div>
      {/each}
      
    </Column>
  </Row>
</Grid>
</Content>

<PatientDrawer 
patient={$selectedPatient} 
isOpen={isDrawerOpen} 
onClose={closeDrawer}
allPatients={filteredParticipants}
currentIndex={currentPatientIndex}
onNavigate={handleDrawerNavigation}
/>

<style>
:global(body) {
  font-family: 'IBM Plex Sans', sans-serif;
}
</style>
