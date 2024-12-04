<script lang="ts">
  import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-svelte';
  
  let isExplainerVisible = true;

  function toggleExplainer() {
    isExplainerVisible = !isExplainerVisible;
  }
</script>

<div class="explainer-container" class:collapsed={!isExplainerVisible}>
  <div class="explainer-content">
    <div class="explainer-grid">
      <!-- Navigation Section -->
      <div class="explainer-section">
        <h3>Navigation</h3>
        <div class="nav-items">
          <div class="nav-item">
            <div class="key-combo">
              <div class="key"><ArrowLeft size={12}/></div>
              <div class="key"><ArrowRight size={12}/></div>
            </div>
            <p class="text-xs">Navigate between years</p>
          </div>
          <div class="nav-item">
            <div class="key-combo">
              <div class="key">Click</div>
            </div>
            <p class="text-xs">Select year or petal</p>
          </div>
        </div>
      </div>

      <!-- Reading Guide Section -->
      <div class="explainer-section">
        <h3>Reading the Chart</h3>
        <div class="reading-items">
          <p class="text-xs">• Vertical position shows total RPD designations</p>
          <p class="text-xs">• Line connects related designations</p>
          <p class="text-xs">• Active year highlighted in red</p>
        </div>
      </div>

      <!-- Flower Guide Section -->
      <div class="explainer-section">
        <h3>Understanding Flowers</h3>
        <div class="flower-items">
          <p class="text-xs">• Each flower represents one year</p>
          <p class="text-xs">• Petals show individual vouchers</p>
          <p class="text-xs">• Colors indicate therapeutic areas</p>
        </div>
      </div>
    </div>
  </div>
  
</div>

<style>
  .explainer-container {
    position: absolute;
    margin-left: .825rem;
    top: 0;
    left: 0;
    z-index: 40;
    display: flex;
    transition: transform 0.3s ease;
  }

  .explainer-container.collapsed .explainer-content {
    transform: translateX(-100%);
  }

  .explainer-content {
    background-color: #f6f0e4f1;
    border: 0.5px solid #ccc;
    padding: 1rem;
    max-width: calc(100vw - 2rem);
    transition: transform 0.3s ease;
  }

  .explainer-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(150px, 1fr));
    gap: 1.5rem;
    max-width: 100%;
  }

  @media (max-width: 768px) {
    .explainer-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  .explainer-section {
    padding: 0.5rem;
  }

  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.625rem;
    color: #C9623F;
    margin-bottom: 0.62rem;
  }

  .nav-items, .reading-items, .flower-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .key-combo {
    display: flex;
    gap: 0.25rem;
  }

  .key {
    background-color: #fff4f0;
    border: 0.5px solid #d1d1d1;
    padding: 0.25rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    min-width: 1.5rem;
  }

  p {
    font-size: 0.75rem;
    line-height: 1.4;
    color: #4a5568;
  }

  .text-xs {
    font-size: 0.75rem;
  }
</style>