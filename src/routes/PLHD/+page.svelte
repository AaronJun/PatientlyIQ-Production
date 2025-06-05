<script lang="ts">
  import { onMount } from 'svelte';
  
  // Mobile menu state
  let isMenuOpen = false;
  
  // Active tab state
  let activeTab = 'SENTIMENT';
  
  // Testimonial data
  const testimonials = [
    {
      quote: "PLHD's approach to patient communication has transformed how we engage with our community. The insights have been invaluable.",
      author: "Dr. Sarah Chen",
      role: "Patient Engagement Director",
      avatar: "/placeholder.svg?height=60&width=60"
    },
    {
      quote: "Their data-driven design approach helped us create materials that truly resonate with patients and improve health outcomes.",
      author: "Michael Rodriguez",
      role: "Healthcare Communications Lead",
      avatar: "/placeholder.svg?height=60&width=60"
    },
    {
      quote: "PLHD has revolutionized how we understand and respond to patient needs. Their insights drive our strategy.",
      author: "Emma Thompson",
      role: "Clinical Research Director",
      avatar: "/placeholder.svg?height=60&width=60"
    }
  ];
  
  // Features data
  const features = [
    {
      title: "Patient Sentiment Analysis",
      description: "Uncover deep insights into patient experiences and needs through advanced data analysis and social listening.",
      icon: "users"
    },
    {
      title: "Design Strategy",
      description: "Transform complex health information into clear, engaging, and accessible patient communications.",
      icon: "bar-chart"
    },
    {
      title: "Patient-Led Solutions",
      description: "Develop strategies and materials that truly reflect patient needs and experiences.",
      icon: "volume-2"
    },
    {
      title: "Healthcare Communications",
      description: "Create impactful healthcare communications backed by patient insights and design thinking.",
      icon: "message-square"
    }
  ];
  
  // Pricing data
  const pricingPlans = [
    {
      name: "Insights",
      price: "Custom",
      period: "pricing",
      description: "For teams seeking patient sentiment data",
      features: [
        "Patient sentiment analysis",
        "Basic data visualization",
        "Quarterly insights reports",
        "Standard data access"
      ],
      cta: "Request Quote",
      highlighted: false
    },
    {
      name: "Design",
      price: "Custom",
      period: "pricing",
      description: "For organizations needing comprehensive solutions",
      features: [
        "All Insights features",
        "Custom design solutions",
        "Patient communication strategy",
        "Material development",
        "Dedicated design team",
        "Implementation support"
      ],
      cta: "Project Inquiries",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For partners needing full-service solutions",
      features: [
        "All Design features",
        "Full strategy development",
        "Custom research",
        "White-label options",
        "Strategic consulting",
        "Priority support"
      ],
      cta: "Contact Us",
      highlighted: false
    }
  ];
  
  // Handle tab change
  function setActiveTab(tab: string) {
    activeTab = tab;
  }

  // Smooth scroll function
  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    isMenuOpen = false;
  }
  
  // Handle intersection observer for animations
  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  });
</script>

<svelte:head>
  <title>PLHD - Plain Language Health Design</title>
</svelte:head>

<div class="font-sans text-gray-900 antialiased">
  <!-- Tab Navigation -->
  <div class="bg-gray-900 text-gray-400">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex space-x-8 py-4">
        <button 
          class="text-sm font-medium transition-colors {activeTab === 'SENTIMENT' ? 'text-teal-400' : 'hover:text-white'}" 
          on:click={() => setActiveTab('SENTIMENT')}
        >
          SENTIMENT ANALYSIS
        </button>
        <button 
          class="text-sm font-medium transition-colors {activeTab === 'DESIGN' ? 'text-teal-400' : 'hover:text-white'}" 
          on:click={() => setActiveTab('DESIGN')}
        >
          DESIGN STRATEGY
        </button>
        <button 
          class="text-sm font-medium transition-colors {activeTab === 'ENGAGEMENT' ? 'text-teal-400' : 'hover:text-white'}" 
          on:click={() => setActiveTab('ENGAGEMENT')}
        >
          PATIENT ENGAGEMENT
        </button>
      </div>
    </div>
  </div>

  <!-- Tab Content Showcase -->
  <div class="bg-gray-900 text-white pt-12 pb-24">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row gap-12 items-center">
        <!-- Left content - Logo and text -->
        <div class="md:w-1/2">
          <div class="flex items-center space-x-4 mb-6">
            <div class="h-12 w-12 bg-gray-800 rounded-md flex items-center justify-center">
              <svg class="h-6 w-6 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <div class="text-xl font-medium">PLHD</div>
          </div>
          
          {#if activeTab === 'SENTIMENT'}
            <h2 class="text-2xl md:text-3xl font-bold mb-6">
              Patient sentiment analysis powers healthcare insights
            </h2>
            <p class="text-gray-400 mb-8">
              PLHD's sentiment analysis engine processes millions of patient interactions to reveal deep insights about healthcare experiences.
            </p>
            <ul class="space-y-4">
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v4l3 3"></path>
                </svg>
                <span>Process millions of patient conversations</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Advanced emotion detection and analysis</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
                <span>Self-host or deploy to PLHD Cloud</span>
              </li>
            </ul>
          {:else if activeTab === 'DESIGN'}
            <h2 class="text-2xl md:text-3xl font-bold mb-6">
              Transform insights into compelling healthcare design
            </h2>
            <p class="text-gray-400 mb-8">
              Our design expertise transforms complex health information into clear, engaging materials that resonate with patients.
            </p>
            <ul class="space-y-4">
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span>Evidence-based design principles</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>Visual clarity for complex information</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                <span>Customized design systems</span>
              </li>
            </ul>
          {:else if activeTab === 'ENGAGEMENT'}
            <h2 class="text-2xl md:text-3xl font-bold mb-6">
              Strategies that drive meaningful patient engagement
            </h2>
            <p class="text-gray-400 mb-8">
              PLHD builds comprehensive engagement frameworks that connect healthcare providers with patients' true needs.
            </p>
            <ul class="space-y-4">
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>Patient-centered strategy development</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>Multi-channel engagement frameworks</span>
              </li>
              <li class="flex items-center">
                <svg class="h-5 w-5 text-teal-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span>Performance measurement and optimization</span>
              </li>
            </ul>
          {/if}
          
          <div class="mt-8">
            <button class="bg-teal-400 hover:bg-teal-500 text-gray-900 font-medium py-2 px-5 rounded-md transition-colors">
              Contact sales
            </button>
          </div>
        </div>
        
        <!-- Right content - Image -->
        <div class="md:w-1/2">
          {#if activeTab === 'SENTIMENT'}
            <div class="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
              <img src="/placeholder.svg?height=600&width=500" alt="PLHD Sentiment Analysis Dashboard" class="w-full" />
            </div>
          {:else if activeTab === 'DESIGN'}
            <div class="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
              <img src="/placeholder.svg?height=600&width=500" alt="PLHD Design Strategy" class="w-full" />
            </div>
          {:else if activeTab === 'ENGAGEMENT'}
            <div class="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
              <img src="/placeholder.svg?height=600&width=500" alt="PLHD Patient Engagement" class="w-full" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Header -->
  <header class="w-full bg-white shadow-sm z-40">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <div class="flex items-center">
          <svg class="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <span class="ml-2 text-xl font-bold text-gray-900">PLHD</span>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <button on:click={() => scrollToSection('features')} class="text-gray-600 hover:text-rose-500 transition-colors">Features</button>
          <button on:click={() => scrollToSection('testimonials')} class="text-gray-600 hover:text-rose-500 transition-colors">Testimonials</button>
          <button on:click={() => scrollToSection('about')} class="text-gray-600 hover:text-rose-500 transition-colors">About</button>
        </nav>
        
        <!-- CTA Button -->
        <div class="hidden md:block">
          <button on:click={() => scrollToSection('cta')} class="bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Project Inquiries
          </button>
        </div>
        
        <!-- Mobile Menu Button -->
        <button on:click={() => isMenuOpen = !isMenuOpen} class="md:hidden text-gray-600 hover:text-rose-500">
          {#if isMenuOpen}
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          {:else}
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          {/if}
        </button>
      </div>
      
      <!-- Mobile Menu -->
      {#if isMenuOpen}
        <div class="md:hidden py-4 border-t border-gray-200">
          <div class="flex flex-col space-y-3">
            <button on:click={() => scrollToSection('features')} class="text-gray-600 hover:text-rose-500 transition-colors">Features</button>
            <button on:click={() => scrollToSection('testimonials')} class="text-gray-600 hover:text-rose-500 transition-colors">Testimonials</button>
            <button on:click={() => scrollToSection('about')} class="text-gray-600 hover:text-rose-500 transition-colors">About</button>
            <button on:click={() => scrollToSection('cta')} class="bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full mt-2">
              Project Inquiries
            </button>
          </div>
        </div>
      {/if}
    </div>
  </header>

  <!-- Hero Section -->
  <section class="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-white to-rose-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center">
        <div class="md:w-1/2 md:pr-12 mb-10 md:mb-0">
          <div class="text-sm font-medium text-rose-500 mb-3 animate-on-scroll opacity-0 transition-opacity duration-700">
            Patient-Led Health Design
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-on-scroll opacity-0 transition-opacity duration-700">
            Learning from <span class="text-rose-500">Patient Voices</span> to Improve Patient Lives
          </h1>
          <p class="text-xl text-gray-600 mb-8 animate-on-scroll opacity-0 transition-opacity duration-700 delay-300">
            PLHD transforms patient feedback into actionable healthcare solutions through data-driven design and strategic communications.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 animate-on-scroll opacity-0 transition-opacity duration-700 delay-500">
            <button on:click={() => scrollToSection('cta')} class="bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg">
              Project Inquiries
            </button>
            <button on:click={() => scrollToSection('features')} class="border border-gray-300 hover:border-rose-500 hover:text-rose-500 font-medium py-3 px-6 rounded-lg transition-colors text-lg">
              Learn More
            </button>
          </div>
        </div>
        <div class="md:w-1/2 animate-on-scroll opacity-0 transition-opacity duration-700 delay-700">
          <img src="/placeholder.svg?height=500&width=600" alt="PLHD Dashboard" class="rounded-lg shadow-xl w-full" />
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section id="features" class="py-20 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4 animate-on-scroll opacity-0 transition-opacity duration-700">
          Powerful Tools for Patient-Centered Insights
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto animate-on-scroll opacity-0 transition-opacity duration-700 delay-300">
          Discover how PLHD can help you understand and amplify patient experiences with unprecedented clarity.
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {#each features as feature, i}
          <div class="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-on-scroll opacity-0 transition-opacity duration-700" style="transition-delay: {i * 200}ms">
            <div class="bg-rose-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              {#if feature.icon === 'users'}
                <svg class="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              {:else if feature.icon === 'bar-chart'}
                <svg class="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              {:else if feature.icon === 'volume-2'}
                <svg class="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              {:else if feature.icon === 'message-square'}
                <svg class="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              {/if}
            </div>
            <h3 class="text-xl font-bold mb-3">{feature.title}</h3>
            <p class="text-gray-600">
              {feature.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center gap-12">
        <div class="md:w-1/2 animate-on-scroll opacity-0 transition-opacity duration-700">
          <img src="/placeholder.svg?height=500&width=600" alt="PLHD Platform" class="rounded-lg shadow-xl w-full" />
        </div>
        <div class="md:w-1/2">
          <div class="text-sm font-medium text-rose-500 mb-3 animate-on-scroll opacity-0 transition-opacity duration-700">
            Our Mission
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold mb-6 animate-on-scroll opacity-0 transition-opacity duration-700">
            Making patient voices the center of healthcare decisions
          </h2>
          <p class="text-lg text-gray-600 mb-6 animate-on-scroll opacity-0 transition-opacity duration-700 delay-300">
            At PLHD, we believe that patient experiences should drive healthcare innovation. Our platform combines advanced data analysis with thoughtful design to create healthcare communications that truly resonate.
          </p>
          <p class="text-lg text-gray-600 mb-8 animate-on-scroll opacity-0 transition-opacity duration-700 delay-500">
            By providing unprecedented insights into patient needs and experiences, we help healthcare organizations develop more effective, patient-centered communications and strategies.
          </p>
          <button on:click={() => scrollToSection('cta')} class="bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg animate-on-scroll opacity-0 transition-opacity duration-700 delay-700">
            Learn More About Us
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="testimonials" class="py-20 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4 animate-on-scroll opacity-0 transition-opacity duration-700">
          Trusted by Healthcare Leaders
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto animate-on-scroll opacity-0 transition-opacity duration-700 delay-300">
          See how PLHD is transforming patient-centered research and healthcare.
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        {#each testimonials as testimonial, i}
          <div class="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-on-scroll opacity-0 transition-opacity duration-700" style="transition-delay: {i * 200}ms">
            <div class="flex items-center mb-6">
              <img src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.author} class="h-12 w-12 rounded-full mr-4" />
              <div>
                <h4 class="font-bold">{testimonial.author}</h4>
                <p class="text-gray-600 text-sm">{testimonial.role}</p>
              </div>
            </div>
            <p class="text-gray-700 italic">"{testimonial.quote}"</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="pricing" class="py-20 bg-gray-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4 animate-on-scroll opacity-0 transition-opacity duration-700">
          Solutions Tailored to Your Needs
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto animate-on-scroll opacity-0 transition-opacity duration-700 delay-300">
          We offer customized solutions for different healthcare stakeholders.
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {#each pricingPlans as plan, i}
          <div class="relative animate-on-scroll opacity-0 transition-opacity duration-700" style="transition-delay: {i * 200}ms">
            {#if plan.highlighted}
              <div class="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center">
                <span class="bg-rose-500 text-white text-sm font-medium px-3 py-1 rounded-full">Recommended</span>
              </div>
            {/if}
            <div class={`h-full flex flex-col border ${plan.highlighted ? 'border-rose-500 ring-2 ring-rose-500 ring-opacity-50' : 'border-gray-200'} rounded-xl p-8 ${plan.highlighted ? 'bg-white' : 'bg-gray-50'}`}>
              <h3 class="text-2xl font-bold mb-2">{plan.name}</h3>
              <div class="mb-6">
                <span class="text-4xl font-bold">{plan.price}</span>
                <span class="text-gray-600">{plan.period}</span>
              </div>
              <p class="text-gray-600 mb-6">{plan.description}</p>
              <ul class="space-y-3 mb-8 flex-grow">
                {#each plan.features as feature}
                  <li class="flex items-start">
                    <svg class="h-5 w-5 text-rose-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
              <button class={`w-full py-3 px-4 rounded-lg font-medium ${plan.highlighted ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-white border border-gray-300 hover:border-rose-500 hover:text-rose-500'} transition-colors`}>
                {plan.cta}
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Final CTA Section -->
  <section id="cta" class="py-20 bg-rose-500 text-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl sm:text-4xl font-bold mb-6 animate-on-scroll opacity-0 transition-opacity duration-700">
          Ready to Transform Patient Communications?
        </h2>
        <p class="text-xl mb-8 text-rose-100 animate-on-scroll opacity-0 transition-opacity duration-700 delay-300">
          Join healthcare leaders who are using PLHD to create more effective, patient-centered communications and strategies.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll opacity-0 transition-opacity duration-700 delay-500">
          <button class="bg-white text-rose-500 hover:bg-rose-50 font-medium py-3 px-8 rounded-lg transition-colors text-lg">
            Project Inquiries
          </button>
          <button class="border border-white hover:bg-rose-600 font-medium py-3 px-8 rounded-lg transition-colors text-lg">
            Schedule Demo
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-gray-400 py-12">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h4 class="text-white font-bold mb-4">Product</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Solutions</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Case Studies</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Resources</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold mb-4">Company</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Team</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold mb-4">Resources</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Guides</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Webinars</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold mb-4">Legal</h4>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Security</a></li>
            <li><a href="#" class="hover:text-white transition-colors">HIPAA Compliance</a></li>
          </ul>
        </div>
      </div>
      
      <div class="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
        <div class="flex items-center mb-4 md:mb-0">
          <svg class="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
          <span class="ml-2 text-xl font-bold text-white">PatientlyIQ</span>
        </div>
        
        <div class="flex space-x-6">
          <a href="#" class="text-gray-400 hover:text-white transition-colors">
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition-colors">
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"></path>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition-colors">
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
            </svg>
          </a>
        </div>
      </div>
      
      <div class="text-center mt-8 text-sm">
        <p>&copy; {new Date().getFullYear()} PatientlyIQ. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Animation styles */
  .animate-on-scroll {
    transform: translateY(20px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  
  .animate-on-scroll.show {
    opacity: 1 !important;
    transform: translateY(0);
  }
  
  /* Smooth scrolling for the whole page */
  :global(html) {
    scroll-behavior: smooth;
  }
</style>