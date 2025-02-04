<!-- <script lang="ts">
  // @ts-nocheck
  import "carbon-components-svelte/css/all.css";
  import '@carbon/charts-svelte/styles.css';
  import data from './data/data.json';
  import '@carbon/charts-svelte';
  import PatientCard from "./components/PatientCard.svelte";
  import Arrow from "carbon-icons-svelte/lib/ArrowRight.svelte";

  import {
    InlineNotification,
    SkeletonText,
    Dropdown,
    DataTable,
    ExpandableTile,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SideNavDivider,
    SkipToContent,
    Content,
    Grid,
    Tag,
    Tooltip,
    TooltipDefinition,
    Row,
    Column,
    Button,
    Checkbox,
    TreeView,
    Tabs,
    Tab,
    TabContent,
  } from "carbon-components-svelte";
      
  const therapeuticAreas = [
    { id: "0", text: "Neurological" },
    { id: "1", text: "Respiratory" },
    { id: "2", text: "Hematology" },
  ];

  const diseaseStates = {
    "0": [
      { id: "3", text: "Huntington's Disease" },
      { id: "4", text: "Alzheimer's Disease" },
      { id: "5", text: "ALS" },
    ],
    "1": [
      { id: "6", text: "Asthma" },
      { id: "7", text: "COPD" },
      { id: "8", text: "Cystic Fibrosis" },
    ],
    "2": [
      { id: "9", text: "Sickle Cell Disease" },
      { id: "10", text: "Hemophilia" },
      { id: "11", text: "Leukemia" },
    ],
  };

  let dropdown1_selectedId = "0";
  let dropdown2_selectedId = "";
  let dropdown2_items = diseaseStates[dropdown1_selectedId];

  $: {
    // Update disease state options when therapeutic area changes
    dropdown2_items = diseaseStates[dropdown1_selectedId];
    // Reset disease state selection when therapeutic area changes
    dropdown2_selectedId = "";
  }

  const formatSelected = (items, id) =>
    items.find((item) => item.id === id)?.text ?? "N/A";

  $: primary = formatSelected(therapeuticAreas, dropdown1_selectedId);
  $: secondary = formatSelected(dropdown2_items, dropdown2_selectedId);

  import {BarChartSimple} from '@carbon/charts-svelte';
  let values = ["Baseline", "Rare", "Therapeutic Area"];
  let group = values.slice(0, 2); 

  import BaseChart from '/node_modules/@carbon/charts-svelte/dist/BaseChart.svelte'
  import { ContentSwitcher, Switch } from "carbon-components-svelte";

  function handleFilter() {
    console.log("Selected Therapeutic Area:", primary);
    console.log("Selected Disease State:", secondary);
    // Add your filter logic here
  }

  function clearFilters() {
    dropdown1_selectedId = "0";
    dropdown2_selectedId = "";
  }
</script>


<Content>
  <Grid>
    <Row>
        <Column padding>
          <Dropdown
            light
            size="sm"
            titleText="Therapeutic Area"
            bind:selectedId={dropdown1_selectedId}
            items={therapeuticAreas}
          />
        </Column>

        <Column padding>
          <Dropdown
            light
            size="sm"
            titleText="Disease State"
            bind:selectedId={dropdown2_selectedId}
            items={dropdown2_items}
            disabled={!dropdown1_selectedId}
          />
        </Column>
        <Column></Column>
    </Row>
    <Row style="align-content:right">
      <Column></Column>
    </Row>
    <Row>    
      <Column padding>
        <Button icon = {Arrow}
        on:click={handleFilter}>
      Generate  
    </Button> 
    <Button kind="ghost" on:click={clearFilters}>Clear filters</Button>
  </Column>
    </Row>
 
  </Grid>

<Grid>
<Tabs style="margin-top:var(--cds-layout-05)">
  <Tab label="Patient Cards" />
  <Tab label="Sentiment Atlas" />
  <Tab label="Digital Landscape" />
  <Tab label="Global Landscape" />
  <svelte:fragment slot="content">


    <TabContent style="margin-top:var(--cds-layout-02);margin-bottom:var(--cds-layout-04)">
    <Grid>
      <Row>
        <PatientCard />
      </Row>
    </Grid>
    </TabContent>
    
    
    <TabContent>
      <Grid>
        <Row>
          <Column>
          <h2>Testing</h2>
          </Column>
        </Row>
      </Grid>
      </TabContent>
      <TabContent>
        <Grid>
          <Row>
            <Column>
            <h2>Testing</h2>
            </Column>
          </Row>
        </Grid>
        </TabContent>

        <TabContent>
          <Grid>
            <Row>
              <Column>
              <h2>Testing</h2>
              </Column>
            </Row>
          </Grid>
          </TabContent>

   </svelte:fragment>
   </Tabs> 

   
    <h2>
      Discover Key Insights</h2>
      <Row padding>
        <Column style="padding-bottom:var(--cds-layout-06)">

          <p>
          Adjust the filters below to select which of the therapeutic areas or disease states you want to explore.
          </p>
        </Column>
        </Row>
</Grid>
      
<Grid>
<Row>

<Column></Column>
</Row>

<Column>
</Column>
<Column>

</Column>
</Grid>
</Content>

<Content>
  <Grid>
    <Row>
      <Column>
      <h4 style="text-transform:uppercase;
      margin-bottom:var(--cds-layout-01); 
      font-size:var(--cds-productive-04-font-size); 
      font-weight:800;
      color: #FF5150">
      Summary
      </h4>
      </Column>
    </Row>
    <Row>
      <Column>
      <p>Patient experiences with PH-ILD are marked by a complex array of symptoms and challenges that significantly impact their quality of life.</p>
      </Column>
    </Row>
</Grid>

<Content></Content>

<Content>
<Row>
  <ExpandableTile 
  light>
    <div slot="above" style="height: 2.5rem">
      <Grid narrow>
        <Row>
        <Column>
          <Tag type="green">
            1  </Tag>
        </Column>
          <Column> 
            <h3>Digital Landscape</h3>
          </Column>
          </Row>
      </Grid>
      </div>
  

    <div slot="below" 
    style="height: 100%">
    
    <DataTable
      headers={[
        { key: "name", value: "Subtopic" },
        { key: "sentiment", value: "Sentiment" },
        { key: "status", value: "Status" },
      ]}
      rows={[
        {
          id: "a",
          name: "Resources",
          sentiment: "Negative",
          status: "Static",
        },
        {
          id: "b",
          name: "Load Balancer 1",
          sentiment: "Negative",
          status: "Round robin",
        },
        {
          id: "c",
          name: "Load Balancer 2",
          sentiment: "Negative",
          status: "DNS delegation",
        },
        {
          id: "d",
          name: "Load Balancer 6",
          sentiment: "Negative",
          status: "Round robin",
        },
        {
          id: "e",
          name: "Load Balancer 4",
          sentiment: "Negative",
          status: "Round robin",
        },
        {
          id: "f",
          name: "Load Balancer 5",
          sentiment: "Negative",
          status: "DNS delegation",
        },
      ]}
    />
    </div>
  </ExpandableTile>
  </Row>

<Column></Column>


  <Row>
    <ExpandableTile 
    light>
      <div slot="above" style="height: 5.5rem">
        <Grid narrow>
          <Row>
          <Column>
            <Tag type="blue">
              2  </Tag>
          </Column>
            <Column> 
              <h3>Community Access</h3>
            </Column>     
            <Column> 
              <h3>Community Access</h3>
            </Column>
            </Row>
        </Grid>
        </div>
    
      <div slot="below" 
      style="height: 100%">
      
      <DataTable
        headers={[
          { key: "name", value: "Subtopic" },
          { key: "sentiment", value: "Sentiment" },
          { key: "status", value: "Status" },
        ]}
        rows={[
          {
            id: "a",
            name: "Resources",
            sentiment: "Negative",
            status: "Static",
          },
          {
            id: "b",
            name: "Load Balancer 1",
            sentiment: "Negative",
            status: "Round robin",
          },
          {
            id: "c",
            name: "Load Balancer 2",
            sentiment: "Negative",
            status: "DNS delegation",
          },
          {
            id: "d",
            name: "Load Balancer 6",
            sentiment: "Negative",
            status: "Round robin",
          },
          {
            id: "e",
            name: "Load Balancer 4",
            sentiment: "Negative",
            status: "Round robin",
          },
          {
            id: "f",
            name: "Load Balancer 5",
            sentiment: "Negative",
            status: "DNS delegation",
          },
        ]}
      />
      </div>
    </ExpandableTile>
    </Row>
  <Column>
  </Column>


  <Row>
    <ExpandableTile 
    light>
      <div slot="above" style="height: 2.5rem">
        <Grid narrow>
          <Row>
          <Column>
            <Tag type="red">
              3  </Tag>
          </Column>
            <Column> 
              <h3>Competitive Landscape</h3>
            </Column>
            </Row>
        </Grid>
        </div>
    
      <div slot="below" 
      style="height: 100%">
      
      <DataTable
        headers={[
          { key: "name", value: "Subtopic" },
          { key: "sentiment", value: "Sentiment" },
          { key: "status", value: "Status" },
        ]}
        rows={[
          {
            id: "a",
            name: "Resources",
            sentiment: "Negative",
            status: "Static",
          },
          {
            id: "b",
            name: "Load Balancer 1",
            sentiment: "Negative",
            status: "Round robin",
          },
          {
            id: "c",
            name: "Load Balancer 2",
            sentiment: "Negative",
            status: "DNS delegation",
          },
          {
            id: "d",
            name: "Load Balancer 6",
            sentiment: "Negative",
            status: "Round robin",
          },
          {
            id: "e",
            name: "Load Balancer 4",
            sentiment: "Negative",
            status: "Round robin",
          },
          {
            id: "f",
            name: "Load Balancer 5",
            sentiment: "Negative",
            status: "DNS delegation",
          },
        ]}
      />
      </div>
    </ExpandableTile>
    </Row>
  <Column>
  </Column>
</Content>
  
  
</Content>
  


<style>
 

  h3 {
    font-size:1rem;
    font-weight: 500;
    color:"0E1011";
  }

  </style>  -->