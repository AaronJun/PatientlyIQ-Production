<script lang="ts">
    import CircleNav from './CircleTabs.svelte';
    import TabContent from './TabPanel.svelte';
    const profiles = [
        {
            id: 'profile1',
            label: 'Sarah',
            imageUrl: '/profiles/sarah.jpg',
            content: {
                title: "Sarah's Journey",
                description: "A story of early diagnosis and proactive care."
            }
        },
        {
            id: 'profile2',
            label: 'Michael',
            imageUrl: '/profiles/michael.jpg',
            content: {
                title: "Michael's Experience",
                description: "Navigating treatment options and clinical trials."
            }
        },
        {
            id: 'profile3',
            label: 'Emma',
            imageUrl: '/profiles/emma.jpg',
            content: {
                title: "Emma's Path",
                description: "Supporting family through genetic testing."
            }
        }
    ];

    let currentTab = profiles[0].id;

    function handleTabSelect(event: CustomEvent<string>) {
        currentTab = event.detail;
        console.log('Tab changed to:', currentTab); // Debug log
    }
</script>

<div class="tabs-container">
    <CircleNav 
        tabs={profiles} 
        activeTab={currentTab} 
        on:select={handleTabSelect}
    />
    
    <div class="content-container">
        {#each profiles as profile}
            <TabContent id={profile.id} activeId={currentTab}>
                <h2>{profile.content.title}</h2>
                <p>{profile.content.description}</p>
                <!-- Add more content structure as needed -->
            </TabContent>
        {/each}
    </div>
</div>

<style>
    .tabs-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    .content-container {
        margin-top: 2rem;
    }

    h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #333;
    }

    p {
        font-size: 1.125rem;
        line-height: 1.6;
        color: #666;
    }
</style>