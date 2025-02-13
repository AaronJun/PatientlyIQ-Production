<!-- RPDCompanyConcentricChart.svelte -->
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
    const width = 1200;
    const height = 1200;
    const radius = Math.min(width, height) / 2 - 60;

    // Stage-specific radii (from outer to inner)
    const stageRadii = {
        'PRE': radius * 0.925,
        'P1': radius * 0.825,
        'P1/2': radius * 0.725,
        'P2': radius * 0.625,
        'P3': radius * 0.525,
        'FILED': radius * 0.4125,
        'APRV': radius * 0.285,
        'PRV': radius * 0.15
    };

    // Stage labels configuration
    const stageLabelConfig = {
        padding: { x: 6, y: 4 },
        height: 18,
        cornerRadius: 10
    };

    // Company-specific angles
    const labelRadius = radius * .9725;
    const maxLabelWidth = 85;
    const ANGLE_BUFFER = Math.PI / 24;

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

    // Stage color scale
    const stageColorScale = d3.scaleOrdinal()
        .domain(['PRE', 'P1', 'P1/2', 'P2', 'P3', 'APRV', 'PRV'])
        .range([
            '#4A5568', // Preclinical - slate
            '#60ACA9', // Phase 1 - blue
            '#2B6CB0', // Phase 1/2 - darker blue
            '#2C5282', // Phase 2 - even darker blue
            '#1A365D', // Phase 3 - darkest blue
            '#48BB78', // FDA Approved - green
            '#2F855A'  // PRV Awarded - darker green
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
        if (entry["PRV Issue Year"]) return "PRV";
        if (entry["Approved"] === "Approved") return "APRV";
        if (entry["Filed"] === "Filed") return "FILED";
        
        const stage = entry["Current Development Stage"];
        if (stage === "Preclinical") return "PRE";
        if (stage === "Phase 1") return "P1";
        if (stage === "Phase 1/2") return "P1/2";
        if (stage === "Phase 2" || stage === "Phase 2a" || stage === "Phase 2b") return "P2";
        if (stage === "Phase 3") return "P3";
        return "PRE";
    }

    function showTooltip(event: MouseEvent, d: any, isCompany: boolean = false) {
        const containerRect = svg.getBoundingClientRect();
        tooltipX = event.pageX - containerRect.left;
        tooltipY = event.pageY - containerRect.top;
        
        if (isCompany) {
            tooltipContent = {
                sponsor: d.company,
                drugName: '',
                therapeuticArea: '',
                id: `${d.totalDrugs} drugs in pipeline`
            };
            tooltipBorderColor = '#37587e';
        } else {
            tooltipContent = {
                sponsor: d.Company,
                drugName: d.Candidate,
                therapeuticArea: d.TherapeuticArea1,
                id: d["Current Development Stage"]
            };
            tooltipBorderColor = stageColorScale(getStage(d));
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

    function processDataForLayout(data: any[]) {
        const companiesMap = new Map();
        
        data.forEach(entry => {
            const stage = getStage(entry);
            if (!companiesMap.has(entry.Company)) {
                companiesMap.set(entry.Company, {
                    company: entry.Company,
                    stages: new Map(),
                    totalDrugs: 0
                });
            }
            
            const companyData = companiesMap.get(entry.Company);
            if (!companyData.stages.has(stage)) {
                companyData.stages.set(stage, []);
            }
            
            companyData.stages.get(stage).push(entry);
            companyData.totalDrugs++;
        });

        return Array.from(companiesMap.values());
    }

    function calculateCompanyAngles(companies: any[]) {
        const totalDrugs = companies.reduce((sum, company) => sum + company.totalDrugs, 0);
        let currentAngle = 0;
        const angles = new Map();

        companies.forEach(company => {
            const proportion = company.totalDrugs / totalDrugs;
            const angle = proportion * (2 * Math.PI - (companies.length * ANGLE_BUFFER));
            angles.set(company.company, {
                start: currentAngle,
                end: currentAngle + angle,
                center: currentAngle + angle/2
            });
            currentAngle += angle + ANGLE_BUFFER;
        });

        return angles;
    }

    function createVisualization() {
        if (!svg) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const mainGroup = svgElement.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        // Create containers for different layers
        const linesGroup = mainGroup.append("g").attr("class", "connecting-lines");
        const stagesGroup = mainGroup.append("g").attr("class", "stage-circles");
        const companyLabelsGroup = mainGroup.append("g").attr("class", "company-labels");

        // Create stage circles with rectangular labels
        Object.entries(stageRadii).forEach(([stage, radius]) => {
            // Stage circle
            stagesGroup.append("circle")
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", stageColorScale(stage))
                .attr("stroke-width", .5)
                .attr("stroke-dasharray", "1,4")
                .attr("stroke-opacity", 1);

            // Stage label with background
            const labelAngle = -Math.PI / 10;
            const labelX = radius * Math.cos(labelAngle)- 15;
            const labelY = radius * Math.sin(labelAngle) + 25;

            // Create label group
            const labelGroup = stagesGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .attr("class", "stage-label")
                .attr("dx", "")
                .on("click", () => {
                    onCompanyHover(data.filter(entry => getStage(entry) === stage));
                })
                .on("mouseenter", () => {
                    showTooltip({ clientX: -10, clientY: 10 }, { company: stage }, true);
                })
                .on("mouseleave", () => {
                    hideTooltip();
                });

            // Calculate text width for background
            const tempText = labelGroup.append("text")
                .attr("opacity", 0)
                .text(stage);
            const textWidth = tempText.node().getBBox().width;
            tempText.remove();

            // Background rectangle
            labelGroup.append("rect")
                .attr("x", -stageLabelConfig.padding.x)
                .attr("y", -stageLabelConfig.height/2)
                .attr("width", textWidth + (stageLabelConfig.padding.x))
                .attr("height", stageLabelConfig.height)
                .attr("rx", stageLabelConfig.cornerRadius)
                .attr("fill", '#F8FAFC')
                .attr("opacity", 1);

            // Label text
            labelGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .attr("fill", stageColorScale(stage))
                .attr("font-size", "10.25px")
                .attr("font-weight", "400")
                .text(stage);
        });

        const companies = processDataForLayout(data);
        const companyAngles = calculateCompanyAngles(companies);

        // Draw company sections
        companies.forEach(company => {
            const angle = companyAngles.get(company.company);
            const companyGroup = mainGroup.append("g");

            // Calculate company label position
            const labelAngle = angle.center;
            const labelX = labelRadius * Math.cos(labelAngle - Math.PI/2);
            const labelY = labelRadius * Math.sin(labelAngle - Math.PI/2);

            // Draw connecting lines to drugs
            company.stages.forEach((drugs, stage) => {
                const stageRadius = stageRadii[stage];
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

                drugs.forEach((drug, i) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    linesGroup.append("path")
                        .attr("d", `M${labelX},${labelY}L${drugX},${drugY}`)
                        .attr("stroke", "#37587e")
                        .attr("stroke-width", .725)
                        .attr("stroke-opacity", 0.525)
                        .attr("fill", "none");
                });
            });

            // Company label group
            const labelGroup = companyLabelsGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .on("click", () => {
                    onShowCompanyDetail({
                        Company: company.company,
                        entries: data.filter(entry => entry.Company === company.company),
                        color: '#37587e',
                        companyUrl: data.find(entry => entry.Company === company.company)?.["Link to CrunchBase"] || ""
                    });
                })
                .on("mouseenter", (event) => {
                    labelGroup.select("rect")
                        .transition()
                        .duration(200)
                        .attr("height", 8)
                        .attr("width", 8)
                        .attr("fill", "#FF4A4A")
                        .attr("stroke-width", 0.725)
                        .attr("stroke", "#375810")
                        .style("filter", "drop-shadow(0 2px 2px rgba(0,0,0,0.1))");

                        labelGroup.select("text")
                        .transition()
                        .duration(500)
                        .attr("font-weight", "800")
                        .attr("font-size", "12px")
                        .attr("fill", "#FF4A4A");
                    showTooltip(event, drug);
                        })
                        
                .on("mouseleave", () => {
                    labelGroup.select("rect")
                        .transition()
                        .attr("height", 7.25)
                        .attr("width", 7.25)
                        .attr("fill", "#A598D9")
                        .attr("stroke", "#161616")
                        .attr("stroke-width", 0.725)                   

                        labelGroup.select("text")
                        .transition()
                        .duration(500)
                        .text(truncateText(company.company, maxLabelWidth+12))
                        .attr("fill", "#A598D9")
                        .attr("font-size", "11.25px")
                        .attr("font-weight", "500")
                        .duration(200);
                            hideTooltip();
                        });

            // Company node circle
            labelGroup.append("rect")
                .attr("width", 7.25)
                .attr("height", 7.25)
                .attr("transform", "translate(-3.625, -3.625)")
                .attr("angle", "90")
                .attr("fill", "#A598D9")
                .attr("stroke", "#375810")
                .attr("stroke-width", 0.725);

            // Company text label - positioned consistently outside
            const textAngle = labelAngle > Math.PI ? "end" : "start";
            const dx = labelAngle > Math.PI ? -8 : 8;
            
            labelGroup.append("text")
                .attr("text-anchor", textAngle)
                .attr("dx", dx)
                .attr("dy", "-1em")
                .text(truncateText(company.company, maxLabelWidth+12))
                .attr("fill", "#666666")
                .attr("font-size", "11.25px")
                .attr("font-weight", "500")
                ;

            // Draw drugs for each stage
            company.stages.forEach((drugs, stage) => {
                const stageRadius = stageRadii[stage];
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

                drugs.forEach((drug, i) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const x = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const y = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    const drugGroup = companyGroup.append("g")
                        .attr("transform", `translate(${x},${y})`)
                        .attr("cursor", "pointer");

                    // Drug circle
                    drugGroup.append("circle")
                        .attr("r", 8.25)
                        .attr("fill", therapeuticAreaColorScale(drug.TherapeuticArea1))
                        .attr("stroke", "#565656")
                        .attr("stroke-width", ".425px")

                        .on("mouseenter", (event) => {
                            drugGroup.select("circle")
                                .transition()
                                .duration(200)
                                .attr("r", 10.25)
                                .attr("stroke-width", 1.725)
                                .attr("stroke", "#375810")
                                .style("filter", "drop-shadow(0 2px 2px rgba(0,0,0,0.1))");
                            showTooltip(event, drug);
                        })
                        .on("mouseleave", () => {
                            drugGroup.select("circle")
                                .transition()
                                .attr("r", 8.25)
                                .attr("fill", therapeuticAreaColorScale(drug.TherapeuticArea1))
                                .attr("stroke", "#565656")
                                .attr("stroke-width", ".425px")
                                .duration(200);
                            hideTooltip();
                        })

                    // Hidden label group (shown on hover)
                    const labelGroup = drugGroup.append("g")
                        .attr("opacity", 0)
                        .attr("class", "drug-label");

                    const labelX = drugAngle < Math.PI ? 12 : -12;
                    
                    labelGroup.append("text")
                        .attr("x", labelX)
                        .attr("y", 0)
                        .attr("text-anchor", drugAngle < Math.PI ? "start" : "end")
                        .attr("z-index", 999)
                        .attr("dy", "1.425em")
                        .attr("dx", "-.825em")
                        .text(truncateText(drug.Candidate, maxLabelWidth))
                        .attr("fill", "#565656")
                        .attr("font-size", "11.25px")
                        .style("text-transform", "uppercase");

                    // Interactions
                    drugGroup
                        .on("mouseenter", (event) => {
                            drugGroup.select(".drug-label")
                                .transition()
                                .duration(200)
                                .attr("font-weight", "600")
                                .attr("font-size", "11.25px")
                                .attr("opacity", 1);
                            showTooltip(event, drug);
                        })
                        .on("mouseleave", () => {
                            drugGroup.select(".drug-label")
                                .transition()
                                .duration(200)
                                .attr("opacity", 0);
                            hideTooltip();
                        })
                        .on("click", () => {
                            onShowDrugDetail({
                                drugName: drug.Candidate,
                                year: drug["RPDD Year"],
                                Company: drug.Company,
                                therapeuticArea: drug.TherapeuticArea1,
                                entries: data.filter(entry => entry.TherapeuticArea1 === drug.TherapeuticArea1),
                                color: therapeuticAreaColorScale(drug.TherapeuticArea1),
                                currentStage: drug["Current Development Stage"] || "TBD",
                                indication: drug.Indication || "",
                                rpddAwardDate: drug["RPDD Year"],
                                voucherAwardDate: drug["PRV Issue Year"] || "",
                                treatmentClass: drug.Class1 || "TBD",
                                mechanismOfAction: drug.MOA || "TBD",
                                companyUrl: drug["Link to CrunchBase"] || ""
                            });
                        });
                });
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