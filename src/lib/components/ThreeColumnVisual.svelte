<script lang="ts">
  // Import Layerchart primitives (assume available as described)
  import { Rect, Circle } from 'layerchart';
  export let columns = [
    {
      icon: "🏥", // Placeholder, replace with SVG if needed
      bgColor: "#D07A3A",
      cardColor: "#fff",
      iconColor: "#D07A3A",
      text: "Increased financial burden for pharmaceutical companies"
    },
    {
      icon: "💡",
      bgColor: "#B85C1E",
      cardColor: "#fff",
      iconColor: "#B85C1E",
      text: "Slower access to innovative drugs for japanese patients"
    },
    {
      icon: "🎯",
      bgColor: "#2C2F3A",
      cardColor: "#fff",
      iconColor: "#2C2F3A",
      text: "Created challenges for smaller biotechs aiming to enter the japanese market"
    }
  ];
</script>

<div class="three-col-container">
  {#each columns as col, i}
    <div class="col">
      <div class="bg-rect">
        <Rect width={180} height={260} fill={col.bgColor} rx={16} />
      </div>
      <div class="card">
        <Rect width={160} height={200} fill={col.cardColor} rx={12} />
        <div class="icon">
          <Circle r={32} fill={col.iconColor} />
          <span class="icon-text">{col.icon}</span>
        </div>
        <div class="desc">{col.text}</div>
      </div>
    </div>
  {/each}
</div>

<style>
.three-col-container {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin: 2rem 0;
}
.col {
  position: relative;
  width: 180px;
  height: 260px;
  display: flex;
  align-items: flex-end;
}
.bg-rect {
  z-index: 0;
}
.card {
  position: absolute;
  left: 10px;
  top: 20px;
  width: 160px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}
.icon {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-text {
  position: absolute;
  font-size: 2rem;
  color: #fff;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.desc {
  margin-top: 60px;
  text-align: center;
  color: #444;
  font-size: 1rem;
  font-family: 'IBM Plex Serif', serif;
}
</style> 