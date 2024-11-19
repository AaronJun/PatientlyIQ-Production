<script lang="ts">
    import { Button, TextInput, TextArea, Checkbox } from "carbon-components-svelte";
    import { createEventDispatcher } from 'svelte';
  
    export let active = false;
  
    const dispatch = createEventDispatcher();
  
    let hope = '';
    let name = '';
    let email = '';
    let isPatientAdvocate = false;
    let isClinicalProfessional = false;
    let isResearcher = false;
    let isIndustry = false;
  
    function handleSubmit() {
      console.log({ hope, name, email, isPatientAdvocate, isClinicalProfessional, isResearcher, isIndustry });
      dispatch('submit', { hope, name, email, isPatientAdvocate, isClinicalProfessional, isResearcher, isIndustry });
    }
  
    function handleBack() {
      dispatch('back');
    }
  </script>
  
  <div class="end-screen" class:active>
    <h1>What do you hope to see in the future?</h1>
    <p>With another 10 years of the program, so much can be made possible. What are you most hopeful for?</p>
  
    <form on:submit|preventDefault={handleSubmit}>
      <TextArea labelText="Tell us about your vision for the future." bind:value={hope} />
      <TextInput labelText="Name" bind:value={name} />
      <TextInput labelText="Email" type="email" bind:value={email} />
  
      <p>I am a...</p>
      <Checkbox labelText="Patient Advocate" bind:checked={isPatientAdvocate} />
      <Checkbox labelText="Clinical Professional" bind:checked={isClinicalProfessional} />
      <Checkbox labelText="Academic Researcher" bind:checked={isResearcher} />
      <Checkbox labelText="Industry Professional" bind:checked={isIndustry} />
  
      <div class="button-container">
        <Button kind="secondary" on:click={handleBack}>Back to Timeline</Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  </div>
  
  <style>
    .end-screen {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      overlay: auto;
      z-index: 9999;
      background-color: white;
      padding: 5rem 0 0 2.5rem;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
    }
  
    .end-screen.active {
      transform: translateX(0);
    }
  
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  
    p {
      margin-bottom: 1rem;
    }
  
    form {
      display: flex;
      flex-direction: column;   
      gap: 1rem;
    }
  
    .button-container {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
    }
  </style>