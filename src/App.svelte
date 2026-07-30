<script>
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from './assets/vite.svg'
  import heroImg from './assets/hero.png'
  import Counter from './lib/Counter.svelte'
</script>

<div class="flex flex-col min-h-screen items-center">
  <h1 class="self-start font-display heroText text-9xl shrink-0
              ml-30 mt-30">Litho.</h1>
  <div class="flex-1 flex flex-row justify-center items-center">
    <button type="button" class="lds-btn
      bg-lds-primary
      text-lds-primary-content">
      Hello Here!
    </button>
    <button type="button" class="lds-btn
      text-lds-primary-content border-lds-primary">
      I'm Ghost!
    </button>
  </div>
</div>