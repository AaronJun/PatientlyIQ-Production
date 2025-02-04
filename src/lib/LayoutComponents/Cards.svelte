<script lang="ts">
import { 
Grid,
Column,
Row,    
Modal,
Tile,
Tag,
Button, 
} from "carbon-components-svelte";
import InterestGauge from "../components/InterestGauge.svelte";
import MoreArrow from "carbon-icons-svelte/lib/TextLinkAnalysis.svelte";
import ModalContent from "./ModalContent.svelte";
import ShareOfVoiceBubbleChart from "../components/ShareOfVoiceBubbleChart.svelte";
import "carbon-components-svelte/css/all.css";
import Wordcloud from "../components/Wordcloud.svelte";
import DigitalShare from "../components/DigitalShare.svelte";

import { cubicInOut } from 'svelte/easing';
import { fly } from 'svelte/transition';
let openTrialInterest = false;
let openCommunityConcerns = false;
let openHistogramView = false;
</script>

  <Grid padding>
      <Row>
        <Column sm={1} md={4} lg={8}>
        <h3>Interest Index</h3>
        </Column>
      </Row>
      <Row 
      style="margin-bottom: var(--cds-spacing-05)">
        <Column sm={1} md={4} lg={8}>
        <p>The Interest Index is a composite metric that measures the level of interest in a topic across various data sources. It is calculated based on the volume of conversations, the sentiment of those conversations, and the level of engagement with the content.</p>
    </Column>  
    </Row>

        <Row>
          <Column>
                  <Tile>
                      <h4>
                      Clinical Trial Interest
                      </h4>
                      <Tag type="red">Low</Tag>
                  
                  <InterestGauge />
                        
                  <div>
                      <Grid padding>
                              <Row>
                                  <Column>
                                      <p> Community interest in clinical trials is 13.37% lower than the baseline interest in the topic across neurological conditions.</p>
                                  </Column>
                              </Row>
                              <Row>
                                  <Column>
                                      <Button 
                                      kind="secondary"
                                      size="small"
                                    on:click={() => (openTrialInterest = true)} icon={MoreArrow}>View summary</Button> 
                                  </Column>
                              </Row>  
                      </Grid>
                  </div>
                  </Tile>
              </Column>
          
          <Column>
              <Tile>
                  <h4>
                      Community Concerns
                  </h4>
                  <Wordcloud />
                      <div>
                      <Grid padding>
                              <Row>
                                  <Column>
                                      <p> The most frequently-voiced concerns involve quality of care, finances, and day-to-day logistics.</p>
                                  </Column>
                              </Row>
                              <Row>
                                  <Column>
                                      <Button
                                      kind="secondary"
                                      size="small"
                                       href="" icon={MoreArrow}>View summary</Button>
                                  </Column>
                              </Row>  
                      </Grid>
                      </div>
              </Tile>
              
          </Column>

          <Column>
              <Tile>
                  <h4>
                      Digital Landscape
                  </h4>
                  <DigitalShare />
                      <div>
                      <Grid padding>
                              <Row>
                                  <Column>
                                      <p> Share of voice across key patient engagement topics are dominated by a small group of sponsors.</p>
                                  </Column>
                              </Row>
                              <Row>
                                  <Column>
                                        <Button
                                            kind="secondary"
                                            size="small"
                                            href="" icon={MoreArrow}>View summary</Button>
                                  </Column>
                              </Row>  
                      </Grid>
                  </div>
              </Tile>
          </Column>

      </Row>
  </Grid>


<Modal
bind:open={openTrialInterest}
size="lg"
modalHeading="Clinical Trial Interest summary"
on:open
on:close
on:submit
hasScrollingContent>
<ModalContent>
</ModalContent> 
</Modal>

<Modal
danger
bind:open={openCommunityConcerns}
modalHeading="Delete database"
on:click:button--secondary={() => (openCommunityConcerns = false)}
on:open
on:close
on:submit
>
<p>This is a permanent action and cannot be undone.</p>
</Modal>



<style>

div{
  padding-bottom: 1rem;
  align-content: center;
}
p {
  font-size: small;
}
h4 {
  font-size: 1rem;
}

</style>