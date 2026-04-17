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
    <div class="bg-default" data-vaul-drawer-wrapper>
      <RouterView />
    </div>
  </UApp>
</template>
