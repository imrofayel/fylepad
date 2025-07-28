<template>
  <div class="h-screen bg-white w-full flex flex-col items-center justify-center m-auto">
    <SignIn/>
  </div>

  <NuxtLink href="/signup">
    <button class="cl-formButtonPrimary cl-button 🔒️ cl-internal-1o76iuo fixed top-3 right-3 max-w-fit" data-localization-key="formButtonPrimary" data-variant="solid" data-color="primary"><span class="cl-internal-2iusy0">Create an account<svg class="cl-buttonArrowIcon 🔒️ cl-internal-1uq3j8z"><path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m7.25 5-3.5-2.25v4.5L7.25 5Z"></path></svg></span></button>
  </NuxtLink>
</template>

<script lang="ts" setup>

</script>

<style scoped>

body {
  background-color: white !important;
}

</style>