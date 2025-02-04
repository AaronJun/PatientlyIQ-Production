<script lang="ts">
    import {
      AspectRatio,
      Grid,
      Row,
      Column,
      StructuredList,
      StructuredListHead,
      StructuredListRow,
      StructuredListCell,
      StructuredListBody,
      Tag,
      Tile,
      Button,

	  Content

    } from "carbon-components-svelte";  
    export let patientName = "Alyssa J";
    export let age = "Mid-30s";
    export let location = "Chicago, IL";
    export let attributes = ["Patient", "Recently Diagnosed"];
  </script>
  
  <Content>
  
  <div class="Card">
    
      <Row>
        <Column>
          <img src="https://cdn.prod.website-files.com/664cfa8fd20bacacc3a88db2/6664a585afdf570f7d3f7601_Profile%20Photo%201.jpg" alt={patientName} style="width: 75px; max-width: 75px; border-radius: 50%;" />
          <div>
            {#each attributes as attribute}
              <Tag type="blue">{attribute}</Tag>
            {/each}
          </div>
      </Column>
      <Column>
        <h2>{patientName}</h2>
        <p>Age: {age}</p>
        <p>Location: {location}</p>
      </Column>
    </Row>
    <Row>
      <Column>
      <p>“I’m still trying to wrap my head around the diagnosis. I’m not sure what to expect, but I’m trying to stay positive.”</p>
      </Column>
    </Row>
  </div>
</Content>

  
  <style>
    h2 {
     font-size: 1.25rem;
     font-weight: 600;
    }
    
    p {
      font-size: .825rem;
    }

    div.Card {
    padding: 2rem;
    max-width: 35vw;
    border: .25px solid #f6f5ff;
    border-radius: 10px;
    background-color: #f6f5ff;
    box-shadow: 0 4 4px rgba(0, 1, 1, 0.1);
    font-size: 12px;
    }
    
    ul {
      padding-left: 1.5rem;
    }
  </style>