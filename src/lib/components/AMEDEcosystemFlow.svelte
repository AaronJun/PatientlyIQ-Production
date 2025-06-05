<script lang="ts">
    import { writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        Background,
        BackgroundVariant,
        type Edge,
        type Node,
        MarkerType
    } from '@xyflow/svelte';
    import '@xyflow/svelte/dist/style.css';

    // Define node data with proper Svelte structure
    const nodeData = {
        'registered-vc': {
            title: 'Registered VC',
            description: 'Venture Capital with track record',
            color: 'green'
        },
        'pharmaceutical-startup': {
            title: 'Pharmaceutical Startup',
            description: 'Biotech company seeking investment',
            color: 'green'
        },
        'amed': {
            title: 'AMED',
            description: 'Japan Agency for Medical Research and Development',
            color: 'blue'
        }
    };

    // Define custom node styles and positions
    const nodes = writable<Node[]>([
        {
            id: 'registered-vc',
            type: 'default',
            data: { 
                label: nodeData['registered-vc'].title
            },
            position: { x: 50, y: 50 },
            style: 'background: white; border: 2px solid #10b981; border-radius: 8px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); min-width: 200px;'
        },
        {
            id: 'pharmaceutical-startup',
            type: 'default',
            data: { 
                label: nodeData['pharmaceutical-startup'].title
            },
            position: { x: 600, y: 50 },
            style: 'background: white; border: 2px solid #10b981; border-radius: 8px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); min-width: 200px;'
        },
        {
            id: 'amed',
            type: 'default',
            data: { 
                label: nodeData['amed'].title
            },
            position: { x: 300, y: 300 },
            style: 'background: white; border: 2px solid #10b981; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); min-width: 250px;'
        }
    ]);

    // Define edges with custom styling
    const edges = writable<Edge[]>([
        {
            id: 'vc-to-startup-investment',
            source: 'registered-vc',
            target: 'pharmaceutical-startup',
            label: 'Investment',
            type: 'smoothstep',
            style: 'stroke: #10b981; stroke-width: 3;',
            labelStyle: 'fill: #10b981; font-weight: bold; font-size: 14px;',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#10b981'
            }
        },
        {
            id: 'vc-to-startup-support',
            source: 'registered-vc',
            target: 'pharmaceutical-startup',
            label: 'Hands-on Support **',
            type: 'smoothstep',
            style: 'stroke: #3b82f6; stroke-width: 3;',
            labelStyle: 'fill: #3b82f6; font-weight: bold; font-size: 12px;',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3b82f6'
            }
        },
        {
            id: 'amed-to-vc-registration',
            source: 'amed',
            target: 'registered-vc',
            label: 'Registration *',
            type: 'smoothstep',
            style: 'stroke: #10b981; stroke-width: 3;',
            labelStyle: 'fill: #10b981; font-weight: bold; font-size: 14px;',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#10b981'
            }
        },
        {
            id: 'amed-to-startup-subsidy',
            source: 'amed',
            target: 'pharmaceutical-startup',
            label: 'Subsidy',
            type: 'smoothstep',
            style: 'stroke: #3b82f6; stroke-width: 3;',
            labelStyle: 'fill: #3b82f6; font-weight: bold; font-size: 14px;',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3b82f6'
            }
        }
    ]);
</script>

<div class="w-full bg-gray-50 rounded-lg border border-gray-200 my-8">
    <div class="p-4 border-b border-gray-200">
        <h4 class="text-lg font-semibold text-gray-800">AMED Pharmaceutical Startup Ecosystem</h4>
        <p class="text-sm text-gray-600 mt-1">Investment and support flow between registered VCs, AMED, and pharmaceutical startups</p>
    </div>
    
    <div style:height="400px" class="relative">
        <SvelteFlow
            {nodes}
            {edges}
            fitView
            nodesDraggable={false}
            elementsSelectable={false}
        >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </SvelteFlow>
    </div>
    
    <!-- Legend -->
    <div class="p-4 bg-gray-100 border-t border-gray-200">
        <div class="flex flex-wrap gap-4 text-sm">
            <div class="flex items-center">
                <span class="text-green-600 mr-1">*</span>
                <span class="text-gray-700">Registration - Registration of VCs with track records of investment and support, etc., in the drug discovery field</span>
            </div>
            <div class="flex items-center">
                <span class="text-blue-600 mr-1">**</span>
                <span class="text-gray-700">Hands-on Support - Support according to the growth stage of Pharmaceutical Startups from the perspectives on management, development and technology, and regulatory affairs</span>
            </div>
        </div>
    </div>
</div>

<style>
    :global(.svelte-flow__node-default) {
        font-weight: bold;
        color: #047857;
        text-align: center;
        font-size: 16px;
    }
    
    :global(.svelte-flow__handle) {
        opacity: 0 !important;
    }
</style> 