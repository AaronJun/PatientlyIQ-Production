<script lang="ts">
    import { scaleLinear } from 'd3-scale';
    import { line, curveCardinalClosed } from 'd3-shape';
  
    export let patient: {
      sentiments: {
        treatment_options: number;
        care_team: number;
        clinical_trials: number;  
        financial_concerns: number;
        professional_life: number;
        social_life: number;
      }
    };
  
    const dimensions = Object.keys(patient.sentiments).length;
    const angleSlice = (Math.PI * 2) / dimensions;
    const maxValue = 10;
    const radius = 150;
  
    // Format display labels
    const labels = {
      treatment_options: 'Treatment Options',
      care_team: 'Care Team',
      clinical_trials: 'Clinical Trials',
      financial_concerns: 'Financial Concerns',
      professional_life: 'Professional Life',
      social_life: 'Social Life'
    };
  
    // Scale for data points
    const rScale = scaleLinear()
      .domain([0, maxValue])
      .range([0, radius]);
  
    // Generate radar path
    function generatePath(): string {
      const values = Object.values(patient.sentiments);
      const points = values.map((value, i) => {
        const r = rScale(value);
        return [
          r * Math.cos(angleSlice * i - Math.PI / 2),
          r * Math.sin(angleSlice * i - Math.PI / 2)
        ];
      });
  
      const pathGenerator = line()
        .curve(curveCardinalClosed);
  
      return pathGenerator(points as [number, number][]) || '';
    }
  </script>
  
  <div class="w-full h-[400px] relative">
    <svg width="100%" height="100%" viewBox="-200 -200 400 400">
      <!-- Background circles -->
      {#each Array(5) as _, i}
        <circle
          cx="0"
          cy="0"
          r={radius * ((i + 1) / 5)}
          fill="none"
          stroke="#ddd"
          stroke-width="0.5"
          stroke-dasharray="4,4"
        />
      {/each}
  
      <!-- Axis lines -->
      {#each Object.keys(patient.sentiments) as _, i}
        <line
          x1="0"
          y1="0"
          x2={radius * Math.cos(angleSlice * i - Math.PI / 2)}
          y2={radius * Math.sin(angleSlice * i - Math.PI / 2)}
          stroke="#ddd"
          stroke-width="0.5"
        />
        
        <!-- Axis labels -->
        <text
          x={radius * 1.15 * Math.cos(angleSlice * i - Math.PI / 2)}
          y={radius * 1.15 * Math.sin(angleSlice * i - Math.PI / 2)}
          text-anchor="middle"
          dominant-baseline="middle"
          class="text-xs fill-current"
        >
          {labels[Object.keys(patient.sentiments)[i]]}
        </text>
      {/each}
  
      <!-- Data polygon -->
      <path
        d={generatePath()}
        fill="rgba(255, 81, 81, 0.2)"
        stroke="#ff5151"
        stroke-width="2"
      />
    </svg>
  </div>