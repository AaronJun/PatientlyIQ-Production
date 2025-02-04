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
      Button
    } from "carbon-components-svelte";  
    export let patientName = "Alyssa J";
    export let age = "Mid-30s";
    export let location = "Chicago, IL";
    export let attributes = ["Patient", "Recently Diagnosed"];
    export let motivations = [
      "Better managing the symptoms of her CHF",
      "Building up her ability to exercise as before",
      "Maintaining a positive mindset"
    ];
    export let challenges = [
      "Stresses of work-life balance",
      "Declining efficacy of treatment",
      "Feeling of alienation from family and friends"
    ];
    export let quote = "Before I went to the ER, I had no idea what this disease was, at all. I think I've learned a lot since then, but it's all still a journey for me.";
    export let quoteCategories = ["Treatment Landscape", "Diagnostic Journey"];
  </script>
  
  <div class="Card">
      <Grid>
      <Row>
      <Column>
        <h2>{patientName}</h2>
      </Column>
  
      <Column>
        <p>Age: {age}</p>
        <p>Location: {location}</p>
      </Column>
      </Row>
      
      <Row>
        <Column>
        
          <img src="https://cdn.prod.website-files.com/664cfa8fd20bacacc3a88db2/6664a585afdf570f7d3f7601_Profile%20Photo%201.jpg" alt={patientName} style="width: 75px; max-width: 75px; border-radius: 50%;" />
          <div>
            {#each attributes as attribute}
              <Tag type="blue">{attribute}</Tag>
            {/each}
          </div>

        
      
        
      </Column>
    </Row>
        
    <Row> 
      <Column>
        <StructuredList>
          <StructuredListHead>
            <StructuredListRow>
              <StructuredListCell head>Motivations</StructuredListCell>
              <StructuredListCell head>Challenges</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            <StructuredListRow>
              <StructuredListCell>
                <ul>
                  {#each motivations as motivation}
                    <li>{motivation}</li>
                  {/each}
                </ul>
              </StructuredListCell>
              <StructuredListCell>
                <ul>
                  {#each challenges as challenge}
                    <li>{challenge}</li>
                  {/each}
                </ul>
              </StructuredListCell>
            </StructuredListRow>
          </StructuredListBody>
        </StructuredList>
        </Column>
    </Row>
    <Row>
      <Column>
      <h4>Key Quote</h4>
        <blockquote>"{quote}"</blockquote>
          <div>
            {#each quoteCategories as category}
              <Tag type="warm-gray">{category}</Tag>
            {/each}
          </div>
      </Column>
    </Row>
    <Row style="margin-top:var(--cds-layout-04)">
    <Column>
      <Button>Export</Button>
    </Column>
  </Row>
  </Grid>
</div>
  
  <style>
    :global(.bx--structured-list) {
      margin-bottom: 2rem;
    }

    h2 {
     font-size: 1.25rem;
     font-weight: 600;
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

    blockquote {
      padding: 1rem;
      background-color: #f6f5ff;
      margin: 1rem 0;
      border-radius: 5px;
      padding-left: 1rem;
      border: .5px solid var(--cds-border-subtle);
    }
    
    ul {
      padding-left: 1.5rem;
    }
  </style>