<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    export let constellationData: any[];
    export let currentYear: string;
    
    $: yearData = constellationData
        .filter(d => d.Year === currentYear)
        .sort((a, b) => {
            const dateA = new Date(`${a.Year}-${a.Month}-${a.Date}`);
            const dateB = new Date(`${b.Year}-${b.Month}-${b.Date}`);
            return dateA.getTime() - dateB.getTime();
        });
    
    function formatDate(month: string, date: string, year: string): string {
        const monthNames = ["January", "Feburary", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.indexOf(month);
    if (monthIndex === -1) {
        console.error(`Invalid month: ${month}`);
        return `${date}, ${year}`;
    }
    return `${monthNames[monthIndex]} ${date}, ${year}`;
}
    </script>
    
    <div class="table-container">
        <h2>Vouchers Awarded</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Sponsor</th>
                    <th>Drug Name</th>
                </tr>
            </thead>
            <tbody>
                {#each yearData as entry}
                    <tr>
                        <td class="date">{formatDate(entry.Month, entry.Date, entry.Year)}</td>
                        <td class="sponsor">{entry.Sponsor}</td>
                        <td>{entry["Drug Name"]}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    
    <style>

        h2 {
                font-weight: 800;
                font-size: .75rem;
                text-transform: capitalize;
                color: #292F58;
                margin-bottom: 12px;
            }

        .table-container {
            min-height: 250px;
            overflow-y: auto;
            max-width: 95%;
            margin: 2.25rem 2rem 2.25rem 2.25rem;
        }
    
        table {
            width: 90%;
            border-collapse: collapse;
        }
    
        td {
            padding-top: 1rem;
            padding-bottom: 1rem;
            padding-right: .25rem;
            font-size: .75rem;
            text-align: left;
        }
    
        th {
            position: sticky;
            font-size: .65rem;
            text-align: left;
            padding-bottom: .5rem;
            margin-bottom: 2rem;
            font-family: "IBM Plex Mono", monospace;
            border-bottom: .5px solid #292F58;
            top: 0;
        }

        .date {
            font-size: .65rem;
        }

        .sponsor {
            font-weight: 800;
        }

    
        tr:hover {
            background-color: #f1cece;
        }
    </style>