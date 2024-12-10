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
  import { fade } from 'svelte/transition';

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
transition:fade={{ duration: 250 }}
>
    <div class="tooltip-content">
      <div class="flex gap-2 items-baseline">
        <Medication size="16" class="text-gray-600" />
        <p class="text-base font-semibold pl-1">
          {content.drugName}
        </p>
      </div>

      <div class="flex gap-2 items-baseline mb-2">
        <Building size="16" class="text-gray-00" />
        <p class="text-sm font-semibold text-gray-500 pl-1">{content.sponsor}</p> 
      </div>

      <div class="flex gap-2 items-baseline">
        <ReminderMedical class="text-gray-400" size="16" />
        <p class="text-xs font-bold text-gray-500 pl-1">{content.therapeuticArea}</p>
      </div>

      <div class="flex gap-2 items-baseline capitalize">
        <Stethoscope className="text-gray-400" size={16} />
        <p class="text-xs font-bold text-gray-500 pl-1 truncate max-w-[200px]">
          {content.id}
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .tooltip {
    position: fixed;
    background-color: rgba(255, 255, 255, 0.962);    
    border: .5px solid #373737;
    padding: 1rem .5rem .5rem .5rem;
    font-size: 12px;
    pointer-events: none;
    overflow: hidden;
    z-index: 1000;
    min-width: 200px;
    max-width: 200px;
    margin: 0;
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

.therapeutic-area {
  font-size: .725rem;
  max-width: 100%;
  text-transform: capitalize;
  font-weight: 800;
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