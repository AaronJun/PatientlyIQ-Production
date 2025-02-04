<script lang="ts">
    import { Content, Grid, Row, Column, DataTable } from 'carbon-components-svelte';
    import { onMount } from 'svelte';
    import { color, rgb } from 'd3-color';
  
    type Topic = { title: string };
    type Connection = { name: string };
    type InfluenceRanking = { name: string; overall: number; connections: number };
  
    let topics: Topic[] = [];
    let connections: Connection[] = [];
    let influenceRankings: InfluenceRanking[] = [];
  
    const generateRandomData = () => {
      const topicTitles = [
        'Disease Management Strategies',
        'Latest Research Updates',
        'Patient Support Groups',
        'Medication and Treatments',
        'Healthcare Policies',
        'Clinical Trials'
      ];
  
      const connectionNames = [
        'Dr. John Smith',
        'Nurse Emma Brown',
        'Dr. Michael Johnson',
        'Researcher Linda Davis',
        'Pharmacist Kevin Wilson'
      ];
  
      const influenceNames = [
        'Dr. John Smith',
        'Nurse Emma Brown',
        'Dr. Michael Johnson',
        'Researcher Linda Davis',
        'Pharmacist Kevin Wilson'
      ];
  
      topics = topicTitles.map(title => ({ title }));
      connections = connectionNames.map(name => ({ name }));
      influenceRankings = influenceNames.map(name => ({
        name,
        overall: Math.floor(Math.random() * 100),
        connections: Math.floor(Math.random() * 100)
      }));
    };
  
    onMount(() => {
      generateRandomData();
    });
  
    // Prepare data for DataTable
    let tableRows = [];
    let selectedMetricValue = 0;
  </script>
  
  <Content>
    <Grid>
      <Row>
        <Column>
          <div class="modalHeader">
            <h2>Key Topics</h2>
          </div>
          <DataTable
            headers={[
              { key: 'title', value: 'Title' }
            ]}
            rows={topics.map((topic, i) => ({ id: i + 1, title: topic.title }))}
          />
        </Column>
      </Row>
      <Row>
        <Column>
          <div class="modalHeader">
            <h2>Key Connections</h2>
          </div>
          <DataTable
            headers={[
              { key: 'name', value: 'Name' }
            ]}
            rows={connections.map((connection, i) => ({ id: i + 1, name: connection.name }))}
          />
        </Column>
      </Row>
      <Row>
        <Column>
          <div class="modalHeader">
            <h2>KOL Ranking</h2>
          </div>
          <DataTable
            headers={[
              { key: 'name', value: 'Name' },
              { key: 'overall', value: 'Overall %' },
              { key: 'connections', value: 'Connections' }
            ]}
            rows={influenceRankings.map((ranking, i) => ({
              id: i + 1,
              name: ranking.name,
              overall: ranking.overall,
              connections: ranking.connections
            }))}
          />
        </Column>
      </Row>
    </Grid>
  </Content>
  
  <style>
    .modalHeader {
      padding: 2.25rem 1.25rem 2.25rem 2.25rem;
      min-width: 100%;
      color: white;
      background-color: #2c2c2c;
    }
    :global(.bx--data-table) {
      background-color: transparent;
    }
    :global(.bx--data-table th) {
      background-color: rgba(255, 255, 255, 0.1);
    }
    :global(.bx--data-table td) {
      background-color: transparent;
    }
  </style>
  