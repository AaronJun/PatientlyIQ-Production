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
    style="left: {x}px; top: {y/1.25}px; --border-color: {borderColor};"
  >
    <div class="tooltip-content">
        <div class="flex gap-2 items-baseline">
          <Medication size="16" class="text-gray-600" />
          <p class="text-base font-semibold pl-2">
            {content.drugName}
          </p>
        </div>

        <div class="flex gap-2 items-baseline mb-4">
          <Building size="16" class="text-gray-00" />
          <p class="text-base pl-2">{content.sponsor}</p> 
    </div>

      <div class="flex gap-2 items-baseline">
        <ReminderMedical class="text-gray-400"  size="16" />
        <p class="text-xs font-semibold text-gray-600 pl-2">{content.therapeuticArea}</p>
    </div>

    <div class="flex gap-2 items-baseline capitalize">
      <Stethoscope class="text-gray-400" size="16" />
      <p class="text-xs font-semibold text-gray-600 pl-2">{content.id}</p>
  </div>

</div>
</div>
{/if}

<style>
  .tooltip {
    position: fixed;
    margin: 2rem 0 0 2rem;
    background-color: rgba(255, 255, 255, 0.962);    
    border: .5px solid #373737;
    padding: 1rem .5rem .5rem .5rem;
    font-size: 12px;
    pointer-events: none;
    overflow: hidden;
    z-index: 1000;
    min-width: 300px;
    max-width: 300px;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: .625rem;
    background-color: var(--border-color);
  }

  .tooltip-content {
    margin-top: 4px;
  }

  h4 {
    margin: 0 0 8px 0;
    font-size: 1rem;
  }

  p {
    margin: 1px 0;
  }


.sponsor, .sponsor-count {
  font-weight: 800;
  font-size: .725rem;
  text-overflow: ellipsis;

}

.therapeutic-area {
  font-size: .725rem;
  max-width: 100%;
  text-transform: capitalize;
  font-weight: 800;
}

.drug-name {
  font-size: .725rem;
  font-weight: 800;
}

.therapeutic-area {
  font-size: .725rem;
  max-width: 100%;
  text-transform: capitalize;
  text-overflow: ellipsis;

  font-weight: 800;
  color: #6f6f6f;
}

.indication {
  font-size: .725rem;
  font-weight: 800;
  color: #6f6f6f;
  white-space: nowrap;
  overflow: show;
  text-overflow: ellipsis;
  text-transform: capitalize;
  max-width: 250px;
}

.entry-title {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: left;
  gap: 0.725rem;
  margin-bottom: 1.15rem;
}

.entry-bottom {
  display: flex;
  flex-direction: row;
  gap: 0.725rem;
  justify-content: left;
  align-items: center;
  margin-bottom: 0.425rem;
}

.drugname {
  font-size: .945rem;
  line-height: 1.25rem;
  font-weight: 400;
  color: #2e2e2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

</style>