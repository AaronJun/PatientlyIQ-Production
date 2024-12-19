<script lang="ts">
    export let isOpen = false;
    export let onClose: () => void;
  
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
  
    function handleSubmit() {
      // Add your form submission logic here
      console.log('Form submitted:', formData);
      onClose();
    }
  </script>
  
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center {isOpen ? '' : 'hidden'}" on:click|self={onClose}>
    <div class="bg-white p-8 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
      <div class="space-y-6">
        <div>
          <h2 class="text-3xl font-display mb-2">Get in touch</h2>
          <h1 class="text-4xl font-display mb-6">Let's talk about what we can make, build, scale together</h1>
        </div>
  
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">* First Name</label>
              <input
                type="text"
                bind:value={formData.firstName}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">* Last Name</label>
              <input
                type="text"
                bind:value={formData.lastName}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
  
          <div>
            <label class="block text-sm text-gray-600 mb-1">* Country</label>
            <select
              bind:value={formData.country}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="">Select country</option>
              {#each countries as country}
                <option value={country}>{country}</option>
              {/each}
            </select>
          </div>
  
          <div>
            <label class="block text-sm text-gray-600 mb-1">* Company</label>
            <input
              type="text"
              bind:value={formData.company}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
  
          <div>
            <label class="block text-sm text-gray-600 mb-1">* Position/Level</label>
            <select
              bind:value={formData.position}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="">Select position</option>
              {#each positions as position}
                <option value={position}>{position}</option>
              {/each}
            </select>
          </div>
  
          <div>
            <label class="block text-sm text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              bind:value={formData.phone}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
  
          <div>
            <label class="block text-sm text-gray-600 mb-1">* Work Email</label>
            <input
              type="email"
              bind:value={formData.email}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
  
          <div>
            <label class="block text-sm text-gray-600 mb-1">* Please select the reason you want to contact us</label>
            <select
              bind:value={formData.reason}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="">Select reason</option>
              {#each reasons as reason}
                <option value={reason}>{reason}</option>
              {/each}
            </select>
          </div>
  
          <div>
            <label class="block text-sm text-gray-600 mb-1">* Message</label>
            <textarea
              bind:value={formData.message}
              required
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            ></textarea>
          </div>
  
          <div class="flex items-start space-x-2">
            <input
              type="checkbox"
              bind:checked={formData.consent}
              id="consent"
              required
              class="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label for="consent" class="text-sm text-gray-600">
              * I agree to Patiently Studio collecting and processing my personal data to allow me to receive information on services.
            </label>
          </div>
  
          <div class="flex justify-between space-x-4">
            <button
              type="button"
              on:click={onClose}
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <style>
    .font-display {
      font-family: "Editorial New", serif;
    }
  
    /* Optional: Add custom scrollbar styling */
    .overflow-y-auto {
      scrollbar-width: thin;
      scrollbar-color: #E5E7EB transparent;
    }
  
    .overflow-y-auto::-webkit-scrollbar {
      width: 6px;
    }
  
    .overflow-y-auto::-webkit-scrollbar-track {
      background: transparent;
    }
  
    .overflow-y-auto::-webkit-scrollbar-thumb {
      background-color: #E5E7EB;
      border-radius: 3px;
    }
  </style>