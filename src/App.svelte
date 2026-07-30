<script lang="ts">
  import Checkbox from './lib/Checkbox.svelte'
  import GhostButton from './lib/GhostButton.svelte'
  import PrimaryButton from './lib/PrimaryButton.svelte'
  import TonalButton from './lib/TonalButton.svelte'
  import ThemeSeedPicker from './lib/theme/ThemeSeedPicker.svelte'

  let expressiveMotion = false
</script>

<div class="flex flex-col min-h-dvh items-center">
  <div class="fixed top-4 right-4 z-20">
    <ThemeSeedPicker />
  </div>

  <h1 class="self-start font-display heroText text-9xl shrink-0
              ml-30 mt-30">Litho.</h1>

  <div class="flex flex-1 flex-col justify-center items-center gap-6">
    <div class="flex flex-row flex-wrap justify-center items-center gap-2">
      <PrimaryButton>Hello Here!</PrimaryButton>
      <TonalButton>Stay Tonal</TonalButton>
      <GhostButton>I'm Ghost!</GhostButton>
    </div>

    <Checkbox bind:checked={expressiveMotion}>
      Expressive motion
    </Checkbox>
  </div>
</div>
