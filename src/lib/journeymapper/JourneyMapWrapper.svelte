<script lang="ts">
  import { Axis, Chart, Grid, Svg } from 'layerchart';
  import { onMount } from 'svelte';
  import studySchedule from '../../data/journeymap/study_schedule.json';

  interface ScheduleVisit {
    stage: string;
    visit: string;
    week: string;
    assessments: string[];
  }

  interface StudySchedule {
    study_schedule: ScheduleVisit[];
  }

  // Calculate total weeks from study schedule
  const weeks = (studySchedule as StudySchedule).study_schedule.map(visit => {
    // Handle the special case for the last week which is "52 ±2 days"
    if (visit.week.includes('±')) {
      return parseInt(visit.week.split(' ')[0]);
    }
    return parseInt(visit.week);
  });
  
  const totalWeeks = Math.max(...weeks);
  
  // Create data array for weeks
  const data = Array.from({ length: totalWeeks + 1 }, (_, i) => ({ week: i }));
  
  // Define simple accessor functions
  const xAccessor = (d: { week: number }) => d.week;
  const yAccessor = () => 1;
  
  onMount(() => {
    console.log('Component mounted');
  });
</script>
