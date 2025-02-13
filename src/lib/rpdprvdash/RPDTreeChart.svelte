<!-- RPDTreeChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDTooltip from './RPDTooltip.svelte';

    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};

    let svg: SVGElement;
    const width = 1100;
    const height = 1100;
    const radius = Math.min(width, height) / 2 - 60;

    const innerRadius = radius * 0.285;
    const treeLength = radius * .725;
    const labelOffset = -20;
    const maxLabelWidth = 65;
    const maxCompanyLabelWidth = 85;

    const STAGE_LABEL_OFFSET = -80; // Increased offset for stage labels
    const NODE_LABEL_OFFSET = -40;  // Regular offset for other nodes

    const MIN_STAGE_ANGLE = Math.PI / 8;
    const MAX_STAGE_ANGLE = Math.PI / 2;
    const ANGLE_BUFFER = Math.PI / 12;

    let tooltipVisible = false;
    let tooltipContent = {
        sponsor: '',
        drugName: '',
        therapeuticArea: '',
        id: ''
    };
    let tooltipBorderColor = '';
    let tooltipX = 0;
    let tooltipY = 0;

    const stages = [
        'Preclinical',
        'Phase 1',
        'Phase 1/2',
        'Phase 2',
        'Phase 3',
        'FDA Approved',
        'PRV Awarded'
    ];

    // New stage color scale
    const stageColorScale = d3.scaleOrdinal()
        .domain(stages)
        .range([
            '#4A5568', // Preclinical - slate
            '#60ACA9', // Phase 1 - blue
            '#2B6CB0', // Phase 1/2 - darker blue
            '#2C5282', // Phase 2 - even darker blue
            '#1A365D', // Phase 3 - darkest blue
            '#48BB78', // FDA Approved - green
            '#2F855A'  // PRV Awarded - darker green
        ]);

    // Add a lighter version of stage colors for backgrounds
    const stageLightColorScale = d3.scaleOrdinal()
        .domain(stages)
        .range([
            '#EDF2F7', // Preclinical - light slate
            '#E6FFFA', // Phase 1/2 - lighter blue
            '#EBF8FF', // Phase 1 - light blue
            '#E2E8F0', // Phase 2 - light gray blue
            '#EDF2F7', // Phase 3 - lightest blue
            '#F0FFF4', // FDA Approved - light green
            '#F0FFF4'  // PRV Awarded - light green
        ]);

    const therapeuticAreaColorScale = d3.scaleOrdinal()
        .domain([
            'Neurology', 'Oncology', 'Metabolic', 'Ophthalmology', 
            'Cardiovascular', 'Pulmonology', 'Hematology', 
            'Endocrinology', 'Genetic', 'Immunology', 
            'Gastroenterology', 'Hepatology', 'Dermatology', 
            'Neonatology', 'Urology'
        ])
        .range([
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEEAD', '#D4A5A5', '#9DE0AD', 
            '#FF9F1C', '#2EC4B6', '#E71D36', 
            '#FDFFB6', '#CBE896', '#FFA07A', 
            '#98D8C8', '#B8B8D1'
        ]);

    function getStage(entry: any) {
        if (entry["PRV Issue Year"]) return "PRV Awarded";
        if (entry["Approved"] === "Approved") return "FDA Approved";
        
        const stage = entry["Current Development Stage"];
        if (stage === "Preclinical") return "Preclinical";
        if (stage === "Phase 1") return "Phase 1";
        if (stage === "Phase 1/2") return "Phase 1/2";
        if (stage === "Phase 2" || stage === "Phase 2a" || stage === "Phase 2b") return "Phase 2";
        if (stage === "Phase 3") return "Phase 3";
        return "Preclinical";
    }

    function createCustomLinkPath(d: any) {
        const source = { x: d.source.x, y: d.source.y + innerRadius + labelOffset };
        const target = { x: d.target.x, y: d.target.y + innerRadius + labelOffset };
        
        // Convert angle to radians for calculations
        const sourceRad = source.x;
        const targetRad = target.x;
        
        // Calculate midpoint for the step
        const midY = (source.y + target.y) / 2;
        
        // Convert to cartesian coordinates
        const start = {
            x: source.y * Math.cos(sourceRad - Math.PI/2),
            y: source.y * Math.sin(sourceRad - Math.PI/2)
        };
        
        const mid1 = {
            x: midY * Math.cos(sourceRad - Math.PI/2),
            y: midY * Math.sin(sourceRad - Math.PI/2)
        };
        
        const mid2 = {
            x: midY * Math.cos(targetRad - Math.PI/2),
            y: midY * Math.sin(targetRad - Math.PI/2)
        };
        
        const end = {
            x: target.y * Math.cos(targetRad - Math.PI/2),
            y: target.y * Math.sin(targetRad - Math.PI/2)
        };
        
        return `M${start.x},${start.y}
                L${mid1.x},${mid1.y}
                L${mid2.x},${mid2.y}
                L${end.x},${end.y}`;
    }


    function showTooltip(event: MouseEvent, d: any, isCompany: boolean = false) {
        const containerRect = svg.getBoundingClientRect();
        tooltipX = event.pageX - containerRect.left;
        tooltipY = event.pageY - containerRect.top;
        
        if (isCompany) {
            tooltipContent = {
                sponsor: d.data.name,
                drugName: '',
                therapeuticArea: '',
                id: `${d.data.children?.length || 0} drugs in pipeline`
            };
            tooltipBorderColor = stageColorScale(d.parent.data.name);
        } else {
            tooltipContent = {
                sponsor: d.data.data.Company,
                drugName: d.data.data.name,
                therapeuticArea: d.data.data.TherapeuticArea1,
                id: d.data.data["Current Development Stage"]
            };
            tooltipBorderColor = therapeuticAreaColorScale(d.data.data.TherapeuticArea1);
        }
        
        tooltipVisible = true;
    }

    function hideTooltip() {
        tooltipVisible = false;
    }

    function truncateText(text: string, maxWidth: number) {
        if (text.length <= maxWidth / 8) return text;
        return text.slice(0, Math.floor(maxWidth / 8) - 3) + '...';
    }

    function processDataForTree(data: any[]) {
        return stages.map(stage => {
            const stageData = data.filter(d => getStage(d) === stage);
            const companiesMap = new Map();

            stageData.forEach(entry => {
                if (!companiesMap.has(entry.Company)) {
                    companiesMap.set(entry.Company, []);
                }
                companiesMap.get(entry.Company).push(entry);
            });

            return {
                name: stage,
                children: Array.from(companiesMap).map(([company, entries]) => ({
                    name: company,
                    type: 'company',
                    children: entries.map(entry => ({
                        name: entry.Candidate,
                        type: 'drug',
                        data: entry
                    }))
                }))
            };
        });
    }

    function calculateStageAngles(treeData: any[]) {
        const totalDrugs = treeData.reduce((sum, stage) => {
            return sum + stage.children.reduce((stageSum: number, company: any) => 
                stageSum + company.children.length, 0);
        }, 0);

        let currentAngle = 0;
        const angles: number[] = [];
        const stageAngles: number[] = [];

        treeData.forEach((stage, i) => {
            const drugCount = stage.children.reduce((sum: number, company: any) => 
                sum + company.children.length, 0);
            
            const proportion = drugCount / totalDrugs;
            const baseAngle = proportion * (2 * Math.PI - (stages.length * ANGLE_BUFFER));
            const angle = Math.max(MIN_STAGE_ANGLE, 
                                Math.min(MAX_STAGE_ANGLE, baseAngle));
            
            angles.push(angle);
            stageAngles.push(currentAngle);
            currentAngle += angle + ANGLE_BUFFER;
        });

        return { angles, stageAngles };
    }

    function createVisualization() {
        if (!svg) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const mainGroup = svgElement.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        mainGroup.append("circle")
            .attr("r", innerRadius)
            .attr("fill", "none");

        const treeData = processDataForTree(data);
        const { angles, stageAngles } = calculateStageAngles(treeData);

        svgElement.on("mouseleave", hideTooltip);

        treeData.forEach((stageData, i) => {
            const startAngle = stageAngles[i];
            const angleSpread = angles[i];
            const stageColor = stageColorScale(stageData.name);
            const stageLightColor = stageLightColorScale(stageData.name);
            
            const treeLayout = d3.tree()
                .size([angleSpread, treeLength]);

            const root = d3.hierarchy(stageData);
            const tree = treeLayout(root);

            const stageGroup = mainGroup.append("g")
                .attr("transform", `rotate(${(startAngle * 180) / Math.PI})`);

            // Draw links with stage colors
            const links = stageGroup.append("g")
                .selectAll("path")
                .data(tree.links())
                .join("path")
                .attr("fill", "none")
                .attr("stroke", stageColor)
                .attr("stroke-opacity", .25)
                .attr("d", d => createCustomLinkPath(d));

            const nodes = stageGroup.append("g")
                .selectAll("g")
                .data(tree.descendants())
                .join("g")
                .attr("transform", d => `
                    rotate(${(d.x * 180) / Math.PI - 90})
                    translate(${d.y + innerRadius + labelOffset},0)
                `);

            // Stage labels with circles
            const stageLabels = nodes.filter(d => !d.parent);
            
            // Add stage node circles
            stageLabels.append("circle")
                .attr("r", 4)
                .attr("fill", stageColor)
                .attr("stroke", "#565656")
                .attr("stroke-width", .725);

            stageLabels.append("text")
                .attr("dx", "-1.725em")
                .attr("dy", "0.31em")
                .attr("text-anchor", "end")
                .text(d => d.data.name)
                .attr("fill", stageColor)
                .attr("font-size", "10.25px")
                .attr("font-weight", "600");

            // Company nodes with stage colors
            const companyNodes = nodes.filter(d => d.parent && !d.parent.parent);
            
            companyNodes.each(function(d) {
                const group = d3.select(this);
                const text = truncateText(d.data.name, maxCompanyLabelWidth);
                const textWidth = text.length * 8;
                const rectWidth = Math.min(Math.max(textWidth + 24, 60), maxCompanyLabelWidth);
                
                const interactiveGroup = group.append("g")
                    .attr("cursor", "pointer")
                    .on("mouseenter", (event) => showTooltip(event, d, true))
                    .on("mouseleave", hideTooltip)
                    .on("click", () => {
                        const companyData = data.filter(entry => entry.Company === d.data.name);
                        onShowCompanyDetail({
                            Company: d.data.name,
                            entries: companyData,
                            color: stageColor,
                            companyUrl: companyData[0]?.["Link to CrunchBase"] || ""
                        });
                    });

                interactiveGroup.append("rect")
                    .attr("x", d.x < Math.PI ? 6 : -rectWidth)
                    .attr("y", -10)
                    .attr("width", rectWidth)
                    .attr("height", 20)
                    .attr("fill", "#F8FAFC");

                interactiveGroup.append("circle")
                    .attr("r", 4)
                    .attr("fill", stageColor);

                interactiveGroup.append("text")
                    .attr("dy", "0.31em")
                    .attr("x", d.x < Math.PI ? 12 : -12)
                    .attr("text-anchor", d.x < Math.PI ? "start" : "end")
                    .attr("transform", d.x >= Math.PI ? "rotate(180)" : null)
                    .text(text)
                    .attr("fill", stageColor)
                    .attr("font-size", "11.25px");
            });

            // Drug nodes (keep therapeutic area colors)
            const drugNodes = nodes.filter(d => d.parent && d.parent.parent);
            
            drugNodes.each(function(d) {
                const group = d3.select(this);
                const text = truncateText(d.data.name, maxLabelWidth);
                const textWidth = text.length * 8;
                const rectWidth = Math.min(Math.max(textWidth + 24, 60), maxLabelWidth);
                
                const interactiveGroup = group.append("g")
                    .attr("cursor", "pointer")
                    .on("mouseenter", (event) => showTooltip(event, d))
                    .on("mouseleave", hideTooltip)
                    .on("click", () => {
                        onShowDrugDetail({
                            drugName: d.data.name,
                            year: d.data.data["RPDD Year"],
                            Company: d.data.data.Company,
                            therapeuticArea: d.data.data.TherapeuticArea1,
                            entries: data.filter(entry => entry.TherapeuticArea1 === d.data.data.TherapeuticArea1),
                            color: therapeuticAreaColorScale(d.data.data.TherapeuticArea1),
                            currentStage: d.data.data["Current Development Stage"] || "TBD",
                            indication: d.data.data.Indication || "",
                            rpddAwardDate: d.data.data["RPDD Year"],
                            voucherAwardDate: d.data.data["PRV Issue Year"] || "",
                            treatmentClass: d.data.data.Class1 || "TBD",
                            mechanismOfAction: d.data.data.MOA || "TBD",
                            companyUrl: d.data.data["Link to CrunchBase"] || ""
                        });
                    });

                interactiveGroup.append("rect")
                    .attr("x", d.x < Math.PI ? 6 : -rectWidth)
                    .attr("y", -10)
                    .attr("width", rectWidth)
                    .attr("height", 20)
                    .attr("fill", "none");

                interactiveGroup.append("circle")
                    .attr("r", 6)
                    .attr("stroke", "#565656")
                    .attr("stroke-width", ".425px")
                    .attr("fill", therapeuticAreaColorScale(d.data.data.TherapeuticArea1));

                interactiveGroup.append("text")
                    .attr("dy", "0.31em")
                    .attr("x", d.x < Math.PI ? 12 : -12)
                    .attr("text-anchor", d.x < Math.PI ? "start" : "end")
                    .attr("transform", d.x >= Math.PI ? "rotate(180)" : null)
                    .text(text)
                    .style("text-transform", "uppercase")
                    .attr("fill", "#565656")
                    .attr("font-size", "10px");
            });
        });
    }

    $: if (data.length > 0 && svg) {
        createVisualization();
    }
</script>

<div class="chart-container">
    <svg
        bind:this={svg}
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        class="w-full h-auto"
    />

    {#if tooltipVisible}
        <RPDTooltip
            visible={tooltipVisible}
            content={tooltipContent}
            borderColor={tooltipBorderColor}
            x={tooltipX}
            y={tooltipY}
        />
    {/if}
</div>

<style>
    .chart-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
    }
</style>