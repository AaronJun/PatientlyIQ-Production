<script>
    import Button from "$lib/components/ui/button/button.svelte";
    import { Calendar, TextSearch, ReceiptText, CodeXml, LineChart } from "lucide-svelte";
  
    // Minor Components Code
    import BentoExampleCode from "$lib/magicui/components/BentoGrid/example/BentoExample.svelte?raw";
    import BentoMarqueeCode from "./BentoMarquee.svelte?raw";
    import BentoCalendarCode from "./BentoCalendar.svelte?raw";
    import BentoComposableCode from "./BentoResizable.svelte?raw"; // BentoResizable.svelte
    import BentoCommandCode from "./BentoCommand.svelte?raw";
  
    //  Minor Components
    import BentoCalendar from "./BentoCalendar.svelte";
    import BentoComposable from "./BentoResizable.svelte";
    import BentoMarquee from "./BentoMarquee.svelte";
    import BentoLineChart from "./BentoLineChart.svelte";
    import BentoCommand from "./BentoCommand.svelte";
  
    // Main Components
    import BentoCard from "./BentoCard.svelte";
    import BentoGrid from "./BentoGrid.svelte";
  
    // Main Components Code
    import BentoCardCode from "./BentoCard.svelte?raw";
    import BentoGridCode from "./BentoGrid.svelte?raw";
  
    //  2 Images
    import BentoCodeImg from "$lib/svg/BentoCode.png";
    import BentoGridImg from "$lib/svg/BentoPage.png";
  
    //  Codeblock
    import CodeBlock from "$lib/luxe/components/codeblock/CodeBlock.svelte";
    const features = [
      {
        Icon: TextSearch,
        name: "Patient Cards tell a story",
        description: "Patient Cards provide an intimate view of specific journeys.",
        href: "/",
        cta: "Learn more",
        background: BentoMarquee,
        class: "col-span-3 lg:col-span-1",
      },
      {
        Icon: ReceiptText,
        name: "Search by indication",
        description: "Search for specific patient groups, by therapeutic area, indication, treatment type, and more.",
        href: "/",
        cta: "Learn more",
        background: BentoCommand,
        class: "col-span-3 lg:col-span-2",
      },
      {
        Icon: Calendar,
        name: "Calendar",
        description: "Use the calendar to filter your files by date.",
        href: "/",
        cta: "Learn more",
        background: BentoCalendar,
        class: "col-span-3 lg:col-span-1",
      },
      {
  Icon: LineChart,
  name: "Frontend Observability",
  description: "Privacy-friendly, lightweight Analytics. Track your post-launch metrics in real-time.",
  href: "/",
  cta: "View Analytics",
  background: BentoLineChart,
  class: "col-span-2",
}
    ];
  
    let allCodes = [
      {
        code: BentoCardCode,
        fileName: "BentoCard.svelte",
      },
      {
        code: BentoExampleCode,
        fileName: "BentoCodeExample.svelte",
      },
      {
        code: BentoMarqueeCode,
        fileName: "BentoMarquee.svelte",
      },
      {
        code: BentoComposableCode,
        fileName: "BentoResizable.svelte",
      },
      {
        code: BentoCommandCode,
        fileName: "BentoCommand.svelte",
      },
      {
        code: BentoGridCode,
        fileName: "BentoGrid.svelte",
      },
      {
        code: BentoCalendarCode,
        fileName: "BentoCalendar.svelte",
      },
    ];
  </script>
  
  <div class="flex justify-top items-center px-3 md:px-64 md:h-screen">
    <BentoGrid>
      {#each features as item}
        <BentoCard {...item} />
      {/each}
    </BentoGrid>
  </div>