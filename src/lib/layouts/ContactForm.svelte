<script>
  import { fade, scale } from 'svelte/transition';
  import "carbon-components-svelte/css/all.css";
  
  let formData = {
      firstName: '',
      lastName: '',
      country: '',
      company: '',
      position: '',
      phone: '',
      email: '',
      reason: '',
      message: '',
      consent: false
  };

  let isSubmitting = false;
  let isSubmitted = false;
  let error = '';
  let focusedField = null;
  
  function handleFocus(fieldName) {
      focusedField = fieldName;
  }
  
  function handleBlur() {
      focusedField = null;
  }

  const positions = [
      'CEO',
      'CTO',
      'CFO',
      'COO',
      'VP',
      'Director',
      'Manager',
      'Other'
  ];

  const reasons = [
      'General Inquiry',
      'Partnership Opportunity',
      'Product Demo',
      'Press Inquiry',
      'Career Opportunity',
      'Other'
  ];

  const countries = [
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'Germany',
      'France',
      'Japan',
      'Other'
  ];

  async function handleSubmit() {
      isSubmitting = true;
      error = '';
      
      try {
          const response = await fetch('/api/contact', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
          });

          const result = await response.json();

          if (result.success) {
              isSubmitted = true;
              formData = {
                  firstName: '',
                  lastName: '',
                  country: '',
                  company: '',
                  position: '',
                  phone: '',
                  email: '',
                  reason: '',
                  message: '',
                  consent: false
              };

              setTimeout(() => {
                  isSubmitted = false;
              }, 5000);
          } else {
              error = result.error || 'Failed to send message. Please try contacting us directly at aaron@patiently.studio';
              console.error('Form submission error:', result);
          }
      } catch (e) {
          console.error('Form submission error:', e);
          error = 'Network error. Please check your connection and try again.';
      } finally {
          isSubmitting = false;
      }
  }
</script>

<div class="text-left mb-16">
  <section id="contact" class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
      <div class="text-left mb-16">
          <div class="section-divide mb-4 flex items-left gap-5">
              <span class="font-mono text-xs font-bold text-gray-500">05</span>
              <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                  Contact us      
              </span>
          </div>
      </div>			
  </section>
</div>


<div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 max-w-7xl">
  {#if isSubmitted}
      <div 
          class="bg-green-50 border border-green-200 rounded-lg p-4 md:p-8 text-left mb-8"
          transition:scale={{ duration: 200, start: 0.95 }}
      >
          <div class="text-green-800 text-xl font-semibold mb-2">Thank you for reaching out!</div>
          <p class="text-green-700">We've received your message and will get back to you soon.</p>
      </div>
  {/if}

  {#if error}
      <div 
          class="bg-red-50 border border-red-200 rounded-lg p-4 md:p-8 text-left mb-8"
          transition:scale={{ duration: 200, start: 0.95 }}
      >
          <div class="text-red-800 text-xl font-semibold mb-2">Oops!</div>
          <p class="text-red-700">{error}</p>
      </div>
  {/if}

  <div class="space-y-6" class:opacity-50={isSubmitting}>
      <div class="text-left mb-">
          <h2 class="animate-fade-in text-balance bg-gradient-to-br from-gray-800 from-30% to-gray-800 bg-clip-text text-3xl md:text-5xl font-light [--animation-delay:200ms] dark:from-white/60 dark:to-white">
              Let's tell a meaningful <span class="font-serif pr-2 italic text-[#ff5151]">story</span> together.
          </h2>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="space-y-6 p-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                  <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'firstName'} class:text-slate-400={focusedField !== 'firstName'}>* First Name</label>
                  <input
                      type="text"
                      bind:value={formData.firstName}
                      required
                      disabled={isSubmitting}
                      on:focus={() => handleFocus('firstName')}
                      on:blur={handleBlur}
                      class="w-full px-3 py-2 border border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
              </div>
              <div>
                  <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'lastName'} class:text-slate-400={focusedField !== 'lastName'}>* Last Name</label>
                  <input
                      type="text"
                      bind:value={formData.lastName}
                      required
                      disabled={isSubmitting}
                      on:focus={() => handleFocus('lastName')}
                      on:blur={handleBlur}
                      class="w-full px-3 py-2 border-bottom border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
              </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                  <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'country'} class:text-slate-400={focusedField !== 'country'}>* Country</label>
                  <select
                      bind:value={formData.country}
                      required
                      disabled={isSubmitting}
                      on:focus={() => handleFocus('country')}
                      on:blur={handleBlur}
                      class="w-full px-3 py-2 border-bottom border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                      <option value="">Select country</option>
                      {#each countries as country}
                          <option value={country}>{country}</option>
                      {/each}
                  </select>
              </div>

              <div>
                  <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'company'} class:text-slate-400={focusedField !== 'company'}>* Company</label>
                  <input
                      type="text"
                      bind:value={formData.company}
                      required
                      disabled={isSubmitting}
                      on:focus={() => handleFocus('company')}
                      on:blur={handleBlur}
                      class="w-full px-3 py-2 border-bottom border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
              </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                  <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'position'} class:text-slate-400={focusedField !== 'position'}>* Position/Level</label>
                  <select
                      bind:value={formData.position}
                      required
                      disabled={isSubmitting}
                      on:focus={() => handleFocus('position')}
                      on:blur={handleBlur}
                      class="w-full px-3 py-2 border-bottom border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                      <option value="">Select position</option>
                      {#each positions as position}
                          <option value={position}>{position}</option>
                      {/each}
                  </select>
              </div>

              <div>
                  <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'phone'} class:text-slate-400={focusedField !== 'phone'}>Phone Number</label>
                  <input
                      type="tel"
                      bind:value={formData.phone}
                      disabled={isSubmitting}
                      on:focus={() => handleFocus('phone')}
                      on:blur={handleBlur}
                      class="w-full px-3 py-2 border-bottom border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
              </div>
          </div>

          <div>
              <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'email'} class:text-slate-400={focusedField !== 'email'}>* Work Email</label>
              <input
                  type="email"
                  bind:value={formData.email}
                  required
                  disabled={isSubmitting}
                  on:focus={() => handleFocus('email')}
                  on:blur={handleBlur}
                  class="w-full px-3 py-2 border-bottom border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
          </div>

          <div>
              <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'reason'} class:text-slate-400={focusedField !== 'reason'}>* Please select the reason you want to contact us</label>
              <select
                  bind:value={formData.reason}
                  required
                  disabled={isSubmitting}
                  on:focus={() => handleFocus('reason')}
                  on:blur={handleBlur}
                  class="w-full px-3 py-2 border-bottom border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                  <option value="">Select reason</option>
                  {#each reasons as reason}
                      <option value={reason}>{reason}</option>
                  {/each}
              </select>
          </div>

          <div>
              <label class="block text-xs font-mono mb-4" class:text-orange-500={focusedField === 'message'} class:text-slate-400={focusedField !== 'message'}>* Message</label>
              <textarea
                  bind:value={formData.message}
                  required
                  disabled={isSubmitting}
                  rows="4"
                  on:focus={() => handleFocus('message')}
                  on:blur={handleBlur}
                  class="w-full px-3 py-2 border-bottom border-slate-400 rounded-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              ></textarea>
          </div>

          <div class="flex items-start space-x-2">
              <input
                  type="checkbox"
                  bind:checked={formData.consent}
                  id="consent"
                  required
                  disabled={isSubmitting}
                  class="mt-1 rounded-none border-slate-500 text-orange-600 focus:ring-orange-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <label for="consent" class="text-sm text-gray-600">
                  * I agree to Patiently Studio collecting and processing my personal data to allow me to receive information on services.
              </label>
          </div>

          <div class="flex justify-start">
              <button
                  type="submit"
                  disabled={isSubmitting}
                  class="w-full sm:w-auto lg:min-w-52 px-6 py-4 mt-12 bg-orange-600 text-white rounded-full hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {#if isSubmitting}
                      <span class="flex items-center justify-center">
                          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                      </span>
                  {:else}
                      Submit
                  {/if}
              </button>
          </div>
      </form>
  </div>
</div>

<style>
  :global(.serif-italic) {
      font-family: 'IBM Plex Serif', serif;
      font-weight: 300;
      font-style: italic;
      color: #ff5151;
  }

  .section-divide {
      border-top: .25px solid #ff5151;
      padding-top: .525rem;
      margin-bottom: 1rem;
  }

  @media (max-width: 640px) {
      .mb-4 {
          padding-top: 0.375rem;
      }
  }
</style>