<template>
  <div class="h-screen w-full flex flex-col items-center justify-center m-auto">
    <SignUp/>
  </div>

    <NuxtLink href="/signin">
    <button class="!bg-[#24d86c] dark:!bg-[#0c843c] dark:!border-[#196838] gap-1 !border-[#28c76d] !text-white font-medium border bg-white/80  !px-[9px] py-[3px]  dark:text-gray-50 rounded-2xl justify-center items-center cursor-pointer flex drop-shadow-cool tab-item transition-all duration-200 fixed top-3 right-3 max-w-fit"><span class="flex items-center">Sign In<svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10.5 16.3q-.2 0-.35-.137T10 15.8V8.2q0-.225.15-.362t.35-.138q.05 0 .35.15l3.625 3.625q.125.125.175.25t.05.275t-.05.275t-.175.25L10.85 16.15q-.075.075-.162.113t-.188.037"/></svg></span></button>
  </NuxtLink>
</template>

<script lang="ts" setup>

</script>

<style>

</style>