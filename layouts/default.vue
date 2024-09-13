<template>
  <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
    <AppHeader/>
    <slot />
  </div>
</template>

<script lang="ts" setup>

</script>

<style>

body{
  background-color: #fcfcfc;
}

</style>