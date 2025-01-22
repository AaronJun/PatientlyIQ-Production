<script lang="ts">
    import CircleTabs from '../tabs/CircleTabs.svelte';
    import TabPanel from '../tabs/TabPanel.svelte';
    
    let activeTab = 'tab1';
    
    const tabs = [
        {
            id: 'tab1',
            label: 'Profile 1',
            imageUrl: '/profiles/profile1.jpg'
        },
        {
            id: 'tab2',
            label: 'Profile 2',
            imageUrl: '/profiles/profile2.jpg'
        },
        {
            id: 'tab3',
            label: 'Profile 3',
            imageUrl: '/profiles/profile3.jpg'
        }
    ];

    function handleTabChange(event: CustomEvent<{tabId: string}>) {
        activeTab = event.detail.tabId;
    }
</script>

<div class="container">
    <CircleTabs {tabs} {activeTab} on:tabChange={handleTabChange}>
        <TabPanel id="tab1" {activeTab}>
            <div class="content">
                <h2>Content for Tab 1</h2>
                <p>This is the content for the first tab panel.</p>
            </div>
        </TabPanel>
        
        <TabPanel id="tab2" {activeTab}>
            <div class="content">
                <h2>Content for Tab 2</h2>
                <p>This is the content for the second tab panel.</p>
            </div>
        </TabPanel>
        
        <TabPanel id="tab3" {activeTab}>
            <div class="content">
                <h2>Content for Tab 3</h2>
                <p>This is the content for the third tab panel.</p>
            </div>
        </TabPanel>
    </CircleTabs>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }
    
    .content {
        padding: 2rem;
        background: #f8f8f8;
        border-radius: 0.5rem;
    }
    
    h2 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: 600;
    }
    
    p {
        line-height: 1.6;
        color: #666;
    }
</style>