<template>
  <UApp
    :tooltip="{
      content: {
        side: 'top',
        sideOffset: 0,
      },
      delayDuration: 30,
    }"
  >
    <RouterView />
  </UApp>
</template>
