<template>
  <Analytics/>
  <VitePwaManifest/>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script>
import { inject } from '@vercel/analytics';

onMounted(() => {
  inject();
})

useSeoMeta({
  title: 'fylepad - your dream notepad!',
  ogTitle: 'fylepad - your dream notepad!',
  description: 'A minimal notepad with literally everything you need.',
  ogDescription: 'An aesthetic notepad for effortless note-taking with AI. Enjoy rich editing, auto-save, multi-tab support, Mermaid / PlantUML diagrams, tables, code-blocks and much more — all in one.',
})

</script>
