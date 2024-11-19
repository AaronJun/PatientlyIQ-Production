<script lang="ts">
  import { 
      ArrowRight,
      Building, 
      ReminderMedical,
      Medication,
      Stethoscope,
      WhitePaper,
      Money
  } from 'carbon-icons-svelte';
  import "carbon-components-svelte/css/all.css";

  export let x: number;
  export let y: number;
  export let visible: boolean;
  export let content: {
    sponsor: string;
    drugName: string;
    therapeuticArea: string;
    id: string;
  };
  export let borderColor: string;
</script>

{#if visible}
  <div
    class="tooltip"
    style="left: {x}px; top: {y}px; --border-color: {borderColor};"
  >
    <div class="tooltip-content">
      <div class="entry-title">
        <Medication size="12" />
        <span class="drugname">{content.drugName}</span> 
      </div>
      <div class="entry-bottom">
        <Building size="12" />
        <span class="sponsor">{content.sponsor}</span> 
      </div>

      <div class="entry-bottom">
        <ReminderMedical size="12" />
        <span class="therapeutic-area">{content.therapeuticArea}</span>
    </div>

    <div class="entry-bottom">
      <Stethoscope size="12" />
      <span class="indication">{content.id}</span>
  </div>
</div>
</div>
{/if}

<style>
  .tooltip {
    position: fixed;
    margin: 2rem 0 0 2rem;
    background-color: rgba(255, 255, 255, 0.962);    
    border: .5px solid #ccc;
    border-radius: 4px;
    padding: 1rem .5rem .5rem .5rem;
    font-size: 14px;
    pointer-events: none;
    z-index: 1000;
    min-width: 300px;
    max-width: 300px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .tooltip::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: .625rem;
    background-color: var(--border-color);
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  .tooltip-content {
    margin-top: 4px;
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 1rem;
  }

  p {
    margin: 4px 0;
  }


.sponsor, .sponsor-count {
  font-weight: 800;
  font-size: .8725rem;
  line-height: 1.15rem;;
  color: #161616;
}

.therapeutic-area {
  font-size: 0.6725rem;
  line-height: 1rem;;
  max-width: 100%;
  text-transform: capitalize;
  font-weight: 800;
  color: #6f6f6f;
}

.drug-name {
  font-size: 1rem;
  font-weight: 00;
  color: #555;
}

.therapeutic-area {
  font-size: 0.8725rem;
  line-height: 1rem;;
  max-width: 100%;
  text-transform: capitalize;
  font-weight: 800;
  color: #6f6f6f;
}

.indication {
  font-size: 0.825rem;
  line-height: 1rem;
  font-weight: 400;
  color: #2e2e2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
  max-width: 250px;
}

.entry-title {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: left;
  align-items: center;
  margin-bottom: 1.15rem;
}

.entry-bottom {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: left;
  align-items: center;
  margin-bottom: 0.425rem;
}

.drugname {
  font-size: 1.125rem;
  line-height: 1.25rem;
  font-weight: 400;
  color: #2e2e2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

</style>