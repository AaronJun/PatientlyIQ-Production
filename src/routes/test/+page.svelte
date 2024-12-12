<script>
    import Carousel from '../../lib/RPDPatientStories/PatientStoriesCarousel.svelte';
    
    let items = [
        {label:'one', color:'red', img:'https://placekitten.com/400/400'},
        {label:'two', color:'green', img:'https://placekitten.com/200/200'},
        {label:'three', color:'blue'},
        {label:'four', color:'orange'},
        {label:'five', color:'yellow'},
        {label:'six', color:'pink'},
        {label:'seven', color:'white'},
        {label:'eight', color:'purple'},
    ];
    
    let current = 0;
    let progress = 0;
    let interval = 5200;
    let auto_interval = null;
    let isPaused = false;
    let isGridView = false;

function toggleView() {
    isGridView = !isGridView;
}

    
    function mod(n, m) {
        return ((n % m) + m) % m;
    }
    
    function startAuto() {
        let startTime;
        auto_interval = setInterval(() => {
            if (!isPaused) {
                const now = Date.now();
                if (!startTime) startTime = now;
                progress = ((now - startTime) / interval) * 100;
                
                if (progress >= 100) {
                    current = mod(current + 1, items.length);
                    startTime = now;
                    progress = 0;
                }
            }
        }, 16);
    }
    
    function stopAuto() {
        clearInterval(auto_interval);
        auto_interval = null;
        progress = 0;
    }
    
    let show = 1;
    
    // Start auto-scroll by default
    startAuto();
    </script>
    
    <div class="carousel-container" 
         on:mousedown={() => isPaused = true}
         on:mouseup={() => isPaused = false}
         on:mouseleave={() => isPaused = false}
         on:touchstart={() => isPaused = true}
         on:touchend={() => isPaused = false}>
        <button class="nav-button prev" on:click={() => current = mod(current-1, items.length)}>←</button>
        <button class="nav-button next" on:click={() => current = mod(current+1, items.length)}>→</button>
        
        <div class="carousel-wrapper">
            <Carousel bind:current items={items} let:item bind:show>
                <div class="item" style='background-color:{item.color};background-image:{item.img?`url(${item.img})`:''};'>
                    {item.label}
                </div>
            </Carousel>
        </div>
        
        <div class="indicators">
            {#each items as _, i}
            <div class="indicator-wrapper" 
                 on:click={() => {
                     current = i;
                     progress = 0;
                 }}>
                <div class="indicator-fill" 
                     style="width: {i === current ? progress : 0}%; 
                            background-color: {i === current ? '#888' : (i < current ? '#888' : '#BBB')};">
                </div>
            </div>
            {/each}
        </div>

    </div>
    <style>
        .carousel-container {
            position: relative;
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(22, 22, 22, 0.85);
        }
    
        .carousel-wrapper {
            width: 100%;
            height: 55vh;
            width: 30.9375vh;
            max-width: 1080px;
            max-height: 1920px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
    
        .nav-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.8);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            z-index: 10;
        } 
    
        .prev { left: 28vw; }
        .next { right: 28.25vw; }
    
        .indicators {
            position: absolute;
            top: 20.25vh;
            display: flex;
            flex-grow: 1;
            gap: .8725rem;
            justify-content: center;
            width: 30.9375vh;
            max-width: 1080px;
        }
        
        .indicator-wrapper {
            width: 2.25rem;
            height: .525rem;
            border-radius: 100px;
            background: #BBB;
            overflow: hidden;
            cursor: pointer;
        }
        
        .indicator-fill {
            height: 100%;
            transition: width 100ms ease-in-out;
        }
    

        .indicator-wrapper:hover {
            background-color: #ff1515;
            transition: width 100ms ease-in-out;

        }
    
        .nav-button:hover {
            background: #ff1515;
            transition: ease-in-out 0.3s;
            cursor: pointer;
        }
    </style>