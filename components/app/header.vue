<template>
  <div class="flex justify-between p-5 py-4">
    
    <div class="flex space-x-2 items-center">

      <div v-for="i in 3">

        <div class="h-4 w-4 border-[1.5px] border-[#c7c7c7] rounded-full"></div>

      </div>

    </div>

    <div class="bg-[#c7c7c780] flex px-3 p-1 rounded-2xl justify-center items-center text-black/60"><Icon name="lucide:ellipsis" size="24"></Icon></div>

  </div>
</template>

<script lang="ts" setup>

</script>

<style>

</style>