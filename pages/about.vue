<template>
  <div class="flex flex-col p-10 space-y-4">

    <div><NuxtLink to="/"><div class="inline-block bg-gray-50 hover:bg-white hover:bg-white/80 dark:bg-[#2d3d33] dark:text-white/90 hover:dark:bg-[#1f2920] dark:border-transparent border-gray-100 border backdrop-blur-xl p-2 rounded-2xl justify-center items-center text-black/75 cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 19l-7-7l7-7m7 7H5"/></svg></div></NuxtLink></div>

    <img src="/assets/icon.png" width="50px">

    <div class="text-2xl text-black/80 dark:text-white/90">fylepad — your perfect note-taking solution!
    </div>

    <div class="text-lg text-black/80 dark:text-white/90">by Rofayel Labs.
    </div>

    <img src="/assets/line.svg" class="relative left-[5rem] -top-4" width="70px" v-if="colorMode.value == 'light'">

    <img src="/assets/lineDark.svg" class="relative left-[5rem] -top-4" width="70px" v-if="colorMode.value == 'dark'">

    <div><div class="text-base inline-block bg-gray-50 hover:bg-white hover:bg-white/80 dark:bg-[#2d3d33] dark:text-white/90 hover:dark:bg-[#1f2920] dark:border-transparent border-gray-100 border backdrop-blur-xl p-2 rounded-xl justify-center items-center text-black/75 cursor-pointer" style="font-family: 'Roboto Mono';">github.com/imrofayel/fylepad</div></div>


  </div>
</template>

<script lang="ts" setup>

const colorMode = useColorMode()

</script>

<style>

</style>