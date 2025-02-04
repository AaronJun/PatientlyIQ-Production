<script lang="ts">
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch, ToolbarMenu, ToolbarMenuItem } from "carbon-components-svelte";
</script>

<DataTable
  sortable
  stickyHeader

  title="Sentiment Analysis"
  description="A sortable view of the most frequently mentioned topics and their associated sentiment."
  headers={[
    { key: "name", value: "Topic" },
    { key: "protocol", value: "Sentiment" },
    { key: "port", value: "Trending" },
    { key: "rule", value: "Mention Rate" },
  ]}
  rows={[
    {
      id: "a",
      name: "Load Balancer 3",
      protocol: "HTTP",
      port: 3000,
      rule: "Round robin",
    },
    {
      id: "b",
      name: "Load Balancer 1",
      protocol: "HTTP",
      port: 443,
      rule: "Round robin",
    },
    {
      id: "c",
      name: "Load Balancer 2",
      protocol: "HTTP",
      port: 80,
      rule: "DNS delegation",
    },
    {
      id: "d",
      name: "Load Balancer 6",
      protocol: "HTTP",
      port: 3000,
      rule: "Round robin",
    },
    {
      id: "e",
      name: "Load Balancer 4",
      protocol: "HTTP",
      port: 443,
      rule: "Round robin",
    },
    {
      id: "f",
      name: "Load Balancer 5",
      protocol: "HTTP",
      port: 80,
      rule: "DNS delegation",
    },
  ]}
>
  <Toolbar>
    <ToolbarContent>
      <ToolbarSearch />
      <ToolbarMenu>     <ToolbarMenuItem primaryFocus>Restart all</ToolbarMenuItem>
        <ToolbarMenuItem href="https://cloud.ibm.com/docs/loadbalancer-service">
          API documentation
        </ToolbarMenuItem>
        <ToolbarMenuItem hasDivider danger>Stop all</ToolbarMenuItem>
   
      </ToolbarMenu>
    </ToolbarContent>
  </Toolbar>
</DataTable>


<style>
    Toolbar {
        padding-right: 1rem;
    }
</style>