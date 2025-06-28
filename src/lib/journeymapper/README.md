# Journey Mapper Components

This package provides components for visualizing clinical trial journey timelines with persona sentiment analysis.

## Components

### JourneyContainer (Recommended)

The unified container that provides perfect alignment between timeline headers, visit details, and persona sentiment data.

```svelte
<script>
  import { JourneyContainer } from '$lib/journeymapper';
  
  const visits = [
    {
      visit_number: 1,
      name: "Screening",
      study_day: "-66 to -56",
      study_week: "Screening",
      assessments: ["Physical Exam", "Medical History"],
      travel_required: false
    },
    // ... more visits
  ];
</script>

<JourneyContainer {visits} timelineWidth={1000} />
```

**Features:**
- ✅ Unified timeline header with visit numbers, study days, weeks, and names
- ✅ Perfect alignment between all timeline elements
- ✅ Integrated visit details with burden scoring
- ✅ Persona sentiment visualization with expandable scales
- ✅ Responsive design for mobile and desktop
- ✅ Interactive hover states and click handlers

### Individual Components

If you need more control, you can use the individual components:

#### JourneyTimeline
Visit details with burden scoring and assessment categorization.

```svelte
<JourneyTimeline {visits} {timelineWidth} hideHeader={true} />
```

#### PersonaGrid
Persona sentiment visualization with expandable sentiment scales.

```svelte
<PersonaGrid {visits} {timelineWidth} hideHeader={true} headerHeight={120} />
```

## Data Format

### Visit Object
```typescript
interface Visit {
  visit_number: number;
  name: string;
  study_day?: string;          // e.g., "14 ±3"
  study_day_range?: string;    // e.g., "-66 to -56"
  study_week?: string;         // e.g., "Week 2"
  assessments: string[];
  travel_required?: boolean;
}
```

### Timeline Positioning
All components use the same timeline positioning algorithm:
- Calculates relative positions based on study days
- Adds 10% padding on each side
- Handles various study day formats (ranges, single values, etc.)

## Styling

The components use a consistent design system:
- **Colors**: Emerald for patients, Sky for caregivers
- **Typography**: Progressive font sizing for hierarchy
- **Spacing**: Consistent rem-based spacing
- **Borders**: Subtle borders for visual separation
- **Animations**: Smooth transitions for interactions

## Responsive Design

All components adapt to different screen sizes:
- **Desktop**: Full timeline with side-by-side layout
- **Tablet**: Stacked layout with horizontal scrolling
- **Mobile**: Compact layout with touch-friendly interactions 