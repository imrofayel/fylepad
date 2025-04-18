<template>
  <div class="w-full bg-black bg-opacity-[0.04]">
    
    <ClientOnly>
    <UiBlurReveal
      :delay="0.1"
      :duration="0.75"
      class="flex flex-col gap-4 items-center justify-center h-screen"
    ><a href="https://www.producthunt.com/posts/fylepad-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-fylepad&#0045;2" target="_blank" class="hidden dark:block"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=954307&theme=dark&t=1744976058116" alt="fylepad - A&#0032;minimal&#0032;notepad&#0032;with&#0032;literally&#0032;everything&#0032;you&#0039;d&#0032;need&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

    <a href="https://www.producthunt.com/posts/fylepad-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-fylepad&#0045;2" target="_blank" class="block dark:hidden"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=954307&theme=light&t=1744991791393" alt="fylepad - A&#0032;minimal&#0032;notepad&#0032;with&#0032;literally&#0032;everything&#0032;you&#0039;d&#0032;need&#0046; | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>


    <h1 style="font-family: 'Instrument Serif Italic';" class="text-6xl my-14 dark:text-white overflow-visible">fylepad</h1>

<NuxtLink href="/app">    <div class="dark:bg-white/5 bg-white border dark:border-none dark:text-white/90 drop-shadow-sm text-xl rounded-xl py-1.5 px-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" width="27" class="inline mr-1" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="m18.05 21l-2.73-4.74c0-1.73-1.07-2.84-2.37-2.84c-.9 0-1.68.5-2.08 1.24c.33-.19.72-.29 1.13-.29c1.3 0 2.36 1.06 2.36 2.36c0 1.31-1.05 2.38-2.36 2.38h3.3V21H6.79c-.24 0-.49-.09-.67-.28a.95.95 0 0 1 0-1.34l.5-.5c-.34-.15-.62-.38-.9-.62c-.22.5-.72.85-1.3.85a1.425 1.425 0 0 1 0-2.85l.47.08v-1.97a4.73 4.73 0 0 1 4.74-4.74h.02c2.12.01 3.77.84 3.77-.47c0-.93.2-1.3.54-1.82c-.73-.34-1.56-.55-2.43-.55c-.53 0-.95-.42-.95-.95c0-.43.28-.79.67-.91l-.67-.04c-.52 0-.95-.42-.95-.94c0-.53.43-.95.95-.95h.95c2.1 0 3.94 1.15 4.93 2.85l.28-.01c.71 0 1.37.23 1.91.61l.45.38c2.17 1.95 1.9 3.27 1.9 3.28c0 1.28-1.06 2.33-2.35 2.33l-.49-.05v.08c0 1.11-.48 2.1-1.23 2.8L20.24 21zm.11-13.26c-.53 0-.95.42-.95.94c0 .53.42.95.95.95c.52 0 .95-.42.95-.95c0-.52-.43-.94-.95-.94"/></svg>
      Open fylepad
        
      <svg xmlns="http://www.w3.org/2000/svg" width="27" class="inline ml-1" viewBox="0 0 24 24"><!-- Icon from Meteor Icons by zkreations - https://github.com/zkreations/icons/blob/main/LICENSE --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m18 9l3 3l-3 3M3 12h18"/></svg>
    </div></NuxtLink>

  <NuxtLink href="https://github.com/imrofayel/fylepad">    <div class="dark:bg-white/5 bg-white border dark:border-none dark:text-white/90 drop-shadow-sm text-xl rounded-xl py-1.5 px-2.5 pr-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="26" class="inline mr-1" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>
      Star us on GitHub <span class="dark:bg-white/10 bg-black/5 p-1 px-2 rounded-xl"><UiNumberTicker :value="stars as any"/>
      </span></div></NuxtLink></UiBlurReveal></ClientOnly>

  </div>

  <div class="h-full dark:bg-white/5 ">

  <div class="absolute top-3 right-3">
    <button @click="onClick('light')" v-if="colorMode.value == 'dark'" :class="[
        'border dark:bg-white/5 !py-[6px] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-[14px] justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Light Mode">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24" class="drop-shadow-sm">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M21.5 14.078A8.557 8.557 0 0 1 9.922 2.5C5.668 3.497 2.5 7.315 2.5 11.873a9.627 9.627 0 0 0 9.627 9.627c4.558 0 8.376-3.168 9.373-7.422"
            color="currentColor" />
        </svg>

      </button>

      <button @click="onClick('dark')" v-if="colorMode.value == 'light'" :class="[
        'border dark:bg-white/5 !py-[6px] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-[14px] justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Dark Mode">
        <svg width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-sm">
          <path d="M17 12a5 5 0 11-10 0 5 5 0 0110 0z" stroke="currentColor" stroke-width="1.5"
            vector-effect="non-scaling-stroke"></path>
          <path
            d="M12 2c-.377.333-.905 1.2 0 2m0 16c.377.333.905 1.2 0 2m7.5-17.497c-.532-.033-1.575.22-1.496 1.495M5.496 17.5c.033.532-.22 1.575-1.496 1.496M5.003 4.5c-.033.532.22 1.576 1.497 1.497M18 17.503c.532-.032 1.575.208 1.496 1.414M22 12c-.333-.377-1.2-.905-2 0m-16-.5c-.333.377-1.2.905-2 0"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
        </svg>
      </button>
  </div>
  
  <ClientOnly>
    <UiBlurReveal
      :delay="0.1"
      :duration="0.75"
      class="p-8"
    >
      <h2 class="text-5xl dark:text-white mb-6" style="font-family: 'Instrument Serif Italic';">Why?</h2>
      <span class="text-pretty dark:text-white text-lg sm:text-xl">
        Designed for note-taking with perfect balance of simplicity and power.
      </span>

      <ul class="pt-6 gap-2 sm:gap-4 flex flex-col dark:text-white text-lg sm:text-xl">
        <span data-name="pencil" data-type="emoji" class="inline-flex gap-2"><img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/270f-fe0f.png" draggable="false" loading="lazy" align="absmiddle" class="w-[22px] max-h-fit"><span>Markdown based formatting with Mermaid and PlantUML support.</span></span>

        <span data-name="book" data-type="emoji" class="inline-flex gap-2"><img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4d6.png" draggable="false" loading="lazy" align="absmiddle" class="w-[22px] max-h-fit"><span>Your progress is saved always locally even you close the app.</span></span>

        <span data-name="crystal_ball" data-type="emoji" class="inline-flex gap-2"><img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f52e.png" draggable="false" loading="lazy" align="absmiddle" class="w-[22px] max-h-fit"><span>Export your notes to PDF or Markdown and import files back.</span></span>

        <span data-name="fire" data-type="emoji" class="inline-flex gap-2"><img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f525.png" draggable="false" loading="lazy" align="absmiddle" class="w-[22px] max-h-fit"><span>Open and work on multiple tabs simultaneously.</span></span>


        <span data-name="green_heart" data-type="emoji" class="inline-flex gap-2"><img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f49a.png" draggable="false" loading="lazy" align="absmiddle" class="w-[22px] max-h-fit"><span>Create tables, diagrams, code-blocks and more.</span></span>

        <span data-name="high_voltage" data-type="emoji" class="inline-flex gap-2"><img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/26a1.png" draggable="false" loading="lazy" align="absmiddle" class="w-[22px] max-h-fit"><span>Powered by a Rust core, it is fast, secure, and memory-efficient.</span></span>

        <span>Its still beta, so expect multiple new features along the way.</span>
      </ul>
    </UiBlurReveal>
  </ClientOnly>
  
  </div>

<div class="h-full bg-black dark:bg-[#161616] dark:bg-opacity-100 bg-opacity-[0.04]">  <ClientOnly>
  <UiBlurReveal
    :delay="0.1"
    :duration="0.75"
    class="p-8"
  >
    <h2 class="text-5xl dark:text-white mb-6" style="font-family: 'Instrument Serif Italic';">Download Apps</h2>
    <span class="text-pretty dark:text-white text-lg sm:text-xl">
      For local first offline note-taking.
    </span>

    <ul class="pt-6 gap-2 gap-y-3 flex flex-wrap dark:text-white text-lg sm:text-xl">
      <NuxtLink href="https://github.com/imrofayel/fylepad/releases"><span class="max-w-fit dark:bg-white/5 bg-black/5 p-1.5 rounded-xl px-2.5 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="26" class="inline mr-1" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M2.67 5.3v.61l-.71.3V5.6zm0 5.94v.62l-.71.29v-.59zm0 6.03v.62l-.71.29v-.59zM2.6 7.29v.55l-.57.26v-.54zm0 1.99v.54l-.57.26v-.54zm0 4.03v.53l-.57.26v-.54zm0 2.02v.54l-.57.26v-.53zm1.9-9.69v.72l-1 .37V6zm0 6.02v.71l-1 .37v-.71zm0 6.04v.71l-1 .4v-.71zm-.07-9.98v.66l-.79.3V8zm0 2.01v.64l-.78.3V10zm0 4.01v.64l-.78.31v-.66zm0 2.02v.65l-.78.31v-.66zm1.88-9.67v.85l-1.26.49v-.84zm0 6.02v.85l-1.26.49v-.84zm0 5.97v.85l-1.26.5v-.85zm-.06-9.9v.76l-1.06.4v-.73zm0 2v.75l-1.06.42v-.75zm0 4.01v.75l-1.06.43v-.75zm0 1.95v.76l-1.06.42v-.75zm2.04-10.1v1.12l-1.57.62V6.67zm0 6.02v1.13l-1.57.61v-1.12zm0 5.97v1.12l-1.57.62v-1.11zm-.09-9.9v1.03l-1.31.53V8.66zm0 2v1.02l-1.31.53v-1.03zm0 4.02v1.03l-1.31.52v-1.03zm0 1.95v1.02l-1.31.52v-1.01zm2.14-10.25v1.47L8.61 8V6.56zm0 6.02v1.46l-1.73.7v-1.47zm0 5.97v1.46l-1.73.7v-1.46zm-.08-9.79v1.23l-1.48.59V8.64zm0 1.92v1.23l-1.48.58v-1.22zm0 4.09v1.25l-1.48.57v-1.23zm0 1.94v1.25l-1.48.59V16.6zm2.19-10.88v2l-1.86.77V6c.64-.35 1.26-.65 1.86-.88m0 2.21v1.73l-1.86.78V8.1zm0 1.95v1.76l-1.86.78v-1.76zm0 1.97V13l-1.86.77V12zm0 1.96V15l-1.86.78V14zm0 2v1.75l-1.86.8V16zm0 1.96v1.87c-.73.28-1.35.55-1.86.8v-1.88zm9.59-11.99v14.05c-1.19-.79-2.67-1.18-4.45-1.18c-1.47 0-3.12.3-4.94.91v-1.9c.97-.37 2.03-.64 3.19-.8v-4.57c-.98.12-2.04.46-3.19 1.02V11.4c.99-.46 2.06-.77 3.19-.94V6c-1.02.18-2.08.53-3.19 1V5.03C14.27 4.34 15.86 4 17.41 4c1.68 0 3.22.39 4.63 1.18m-1.89 1.23c-.76-.41-1.65-.59-2.73-.59c-.13 0-.25.01-.37.02v4.54l.41-.01c.91 0 1.81.13 2.69.43zm0 5.69c-.81-.36-1.72-.54-2.71-.54c-.13 0-.26.01-.39.02v4.58h.41c.99 0 1.89.12 2.69.37z"/></svg><span>Windows</span></span></NuxtLink>

      <NuxtLink href="https://github.com/imrofayel/fylepad/releases"><span class="max-w-fit dark:bg-white/5 bg-black/5 p-1.5 rounded-xl px-2.5 flex items-center "><svg xmlns="http://www.w3.org/2000/svg" width="26" class="inline mr-1" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47c-1.34.03-1.77-.79-3.29-.79c-1.53 0-2 .77-3.27.82c-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51c1.28-.02 2.5.87 3.29.87c.78 0 2.26-1.07 3.81-.91c.65.03 2.47.26 3.64 1.98c-.09.06-2.17 1.28-2.15 3.81c.03 3.02 2.65 4.03 2.68 4.04c-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5c.13 1.17-.34 2.35-1.04 3.19c-.69.85-1.83 1.51-2.95 1.42c-.15-1.15.41-2.35 1.05-3.11"/></svg><span>Mac</span></span></NuxtLink>

      <NuxtLink href="https://github.com/imrofayel/fylepad/releases"><span class="max-w-fit dark:bg-white/5 bg-black/5 p-1.5 rounded-xl px-2.5 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="26" class="inline mr-1" viewBox="0 0 20 20"><!-- Icon from uiw icons by liwen0526 - https://github.com/uiwjs/icons/blob/master/LICENSE --><path fill="currentColor" d="M8.73 4.706q-.046.106-.09.106q-.051.01-.052-.056q0-.134.2-.168h.105a.19.19 0 0 0-.163.118m.957-.034a.17.17 0 0 0-.184-.05q.252-.123.336.022q.031.067-.031.1q-.043.012-.121-.072M6.054 9.543a1 1 0 0 0-.047.14a.7.7 0 0 1-.058.15a1 1 0 0 1-.105.146q-.073.111-.01.134q.042.01.131-.079a.56.56 0 0 0 .153-.279a.4.4 0 0 1 .021-.067a.3.3 0 0 0 .021-.095v-.034l-.01-.027q-.01-.029-.032-.023q-.042-.01-.064.034m8.474 3.504l.079-.307q.036-.138.052-.29q.015-.15.032-.24q.015-.089.005-.25a4 4 0 0 1-.01-.218q0-.056-.037-.245l-.042-.23a9 9 0 0 0-.053-.278l-.057-.296q-.105-.535-.495-1.15q-.389-.614-.757-.836q.253.222.6.926q.915 1.808.567 3.102q-.115.447-.525.469q-.327.045-.405-.206q-.079-.252-.084-.932a5.7 5.7 0 0 0-.121-1.194a8 8 0 0 0-.205-.77a3 3 0 0 0-.205-.508a3 3 0 0 0-.163-.274a1 1 0 0 0-.136-.167l-.079-.078a7.5 7.5 0 0 0-.326-1.15q-.178-.457-.31-.625a3 3 0 0 1-.247-.368a1.4 1.4 0 0 1-.158-.446q-.042-.234.063-.597t.048-.553t-.468-.279a2 2 0 0 1-.468-.2q-.31-.168-.373-.18q-.084-.01-.116-.29a1.2 1.2 0 0 1 .084-.568q.116-.29.379-.302q.389-.033.536.335q.147.369.042.648q-.115.212-.021.295q.095.084.315.006q.137-.045.137-.402v-.413a2.6 2.6 0 0 0-.142-.557a.9.9 0 0 0-.468-.508a1.4 1.4 0 0 0-.284-.084q-1.124.09-.935 1.495q0 .168-.01.168q-.096-.1-.31-.117a1.5 1.5 0 0 0-.348.005q-.13.023-.162-.055q.01-.637-.169-1.005q-.178-.368-.473-.38q-.283-.01-.436.307q-.153.319-.174.664q-.01.168.037.413q.048.245.137.419q.09.172.163.15a.3.3 0 0 0 .168-.156q.042-.1-.074-.09q-.074 0-.163-.161a.85.85 0 0 1-.1-.374a.7.7 0 0 1 .095-.413q.105-.168.357-.156q.18 0 .284.234q.105.234.1.435a2 2 0 0 1-.015.246q-.232.167-.326.323a.9.9 0 0 1-.29.262a4 4 0 0 0-.215.14a.65.65 0 0 0-.163.301q-.026.146.079.201q.147.09.263.218q.115.128.168.212t.194.145t.373.072q.494.023 1.073-.167a3 3 0 0 1 .242-.078q.22-.067.362-.117t.31-.145a.54.54 0 0 0 .221-.196q.095-.156.21-.089a.15.15 0 0 1 .069.095q.015.061-.032.134q-.048.072-.173.106q-.21.067-.595.24l-.478.217q-.462.213-.736.257q-.263.056-.83-.022q-.105-.023-.095.022q.01.044.178.212q.263.257.705.246a1.5 1.5 0 0 0 .378-.079a3 3 0 0 0 .379-.156q.178-.09.352-.195t.316-.19q.141-.083.257-.134q.117-.05.184-.028q.069.023.09.123a.1.1 0 0 1-.01.05a.14.14 0 0 1-.043.056a.8.8 0 0 1-.152.106a1 1 0 0 1-.095.05q-.037.018-.105.056a1 1 0 0 1-.1.05a4.7 4.7 0 0 0-.71.492q-.415.335-.698.48q-.284.145-.515.01q-.221-.122-.663-.814q-.231-.345-.263-.245a.4.4 0 0 0-.01.111q0 .279-.158.63q-.157.353-.31.62a2 2 0 0 0-.22.648a1 1 0 0 0 .12.703q-.242.067-.657 1.004t-.5 1.574a8 8 0 0 0-.015.77q.005.568-.058.658q-.084.268-.305.034q-.336-.346-.378-1.05q-.021-.312.042-.624q.041-.213-.01-.201l-.043.056q-.378.724.105 1.852q.053.134.263.312q.21.18.252.223q.21.258 1.094 1.01q.883.753.977.854a.63.63 0 0 1 .185.424a.72.72 0 0 1-.148.48a.64.64 0 0 1-.478.257q.083.167.305.497q.22.33.294.602q.074.273.074.787q.483-.268.073-1.027a1 1 0 0 0-.11-.179l-.1-.133q-.031-.045-.021-.068q.03-.055.136-.106q.105-.05.21.028q.484.58 1.746.402q1.398-.167 1.86-.971q.242-.424.358-.335q.127.067.105.58q-.01.279-.242 1.027q-.095.256-.063.419q.03.161.252.172q.031-.211.153-.859q.12-.647.142-1.004q.02-.235-.069-.82a6.3 6.3 0 0 1-.078-1.083q.01-.496.241-.787q.158-.2.537-.2q.01-.414.362-.592a1.24 1.24 0 0 1 .763-.117q.41.06.63.25q0-.2-.578-.468m-6.05-9.095q-.059-.146-.121-.167q-.095-.023-.095.078q.021.056.053.067q.105 0 .073.167q-.031.225.085.224q.03 0 .031-.034a.6.6 0 0 0-.026-.335m4.363 2.405a.3.3 0 0 0-.137-.056a.4.4 0 0 1-.152-.06a.5.5 0 0 1-.1-.09a3 3 0 0 1-.132-.162a.2.2 0 0 0-.042-.045q-.01-.005-.042.017q-.147.18.074.485q.22.307.41.352q.095.01.152-.09a.32.32 0 0 0 .037-.223a.23.23 0 0 0-.068-.128M11.038 4.11a.44.44 0 0 0-.053-.218a.4.4 0 0 0-.115-.14q-.064-.044-.095-.033q-.147.01-.074.078l.042.023q.148.045.19.346q0 .033.084-.023zm.541-2.656a.4.4 0 0 0-.094-.079l-.1-.067q-.159-.167-.253-.167q-.095.01-.12.083a.26.26 0 0 0-.01.145a.3.3 0 0 1-.006.14a.4.4 0 0 1-.064.117a.6.6 0 0 0-.063.1q-.01.028.032.096q.042.033.084 0q.042-.034.116-.1a.5.5 0 0 1 .157-.101q.01-.012.095-.011a.5.5 0 0 0 .158-.023q.073-.022.094-.078q0-.022-.026-.055m6.293 15.294q.116.14.126.268a.7.7 0 0 1-.027.25a.6.6 0 0 1-.162.246a3 3 0 0 1-.247.218q-.12.095-.316.206a14 14 0 0 1-.667.357q-.2.1-.284.145a5.5 5.5 0 0 0-.9.625q-.498.413-.793.714q-.178.18-.715.218t-.935-.162a.9.9 0 0 1-.31-.262a1.5 1.5 0 0 1-.174-.285q-.053-.123-.231-.217q-.18-.095-.494-.106a62 62 0 0 0-1.367-.011q-.2 0-.6.016q-.399.017-.61.028a2.3 2.3 0 0 0-.835.168a1.9 1.9 0 0 0-.563.335a2 2 0 0 1-.457.318a1.1 1.1 0 0 1-.562.128q-.304-.011-1.167-.346a10.3 10.3 0 0 0-2.072-.586q-.337-.061-.525-.1a5 5 0 0 1-.415-.106a1.1 1.1 0 0 1-.353-.162a.54.54 0 0 1-.178-.218q-.106-.256.074-.742q.179-.485.189-.608a1.8 1.8 0 0 0-.042-.446a9 9 0 0 0-.105-.475a1.5 1.5 0 0 1-.048-.407q.006-.2.11-.301q.15-.135.6-.157q.452-.023.63-.134q.316-.201.443-.39q.126-.19.126-.57q.22.815-.337 1.183q-.336.223-.872.168q-.358-.035-.453.111q-.135.168.053.636q.021.067.084.201t.09.201a1 1 0 0 1 .047.19a1 1 0 0 1 .01.245q0 .168-.178.547q-.179.379-.148.536q.031.19.39.29q.21.066.888.206t1.046.229q.252.067.778.245q.526.179.867.257q.342.078.583.045q.453-.068.679-.313a.85.85 0 0 0 .242-.536a2.2 2.2 0 0 0-.08-.652a3.3 3.3 0 0 0-.199-.58a8 8 0 0 0-.21-.408q-1.272-2.12-1.777-2.701q-.714-.826-1.188-.446q-.116.1-.158-.168a2 2 0 0 1-.02-.424q.01-.323.104-.58t.253-.525t.23-.468q.085-.235.28-.804q.193-.57.31-.87q.115-.301.315-.68q.2-.381.41-.603Q7.21 7.132 7.36 6.55q-.126-1.25-.169-3.46q-.021-1.003.253-1.69Q7.717.715 8.557.235Q8.967.001 9.65.001q.557-.011 1.115.15q.557.162.935.464q.6.468.962 1.356q.363.886.31 1.645q-.053 1.06.316 2.389q.357 1.26 1.398 2.432q.578.66 1.046 1.82t.625 2.131q.084.547.053.943t-.126.62q-.094.222-.21.245q-.105.022-.248.212q-.141.189-.284.396a1.3 1.3 0 0 1-.425.374q-.284.167-.642.156a1.4 1.4 0 0 1-.33-.056a.5.5 0 0 1-.237-.15a2 2 0 0 1-.142-.173a1.5 1.5 0 0 1-.12-.229q-.075-.162-.095-.217q-.232-.413-.431-.335q-.2.077-.295.546t.074 1.083q.21.78.01 2.176q-.105.725.19 1.122q.294.396.767.368q.473-.03.894-.396q.62-.547.94-.742q.321-.195 1.089-.475q.556-.201.809-.407q.252-.207.194-.385a.63.63 0 0 0-.262-.318a2.5 2.5 0 0 0-.542-.262q-.346-.123-.52-.536a1.9 1.9 0 0 1-.158-.81q.016-.395.163-.53a2.9 2.9 0 0 0 .237 1.084q.078.167.215.318q.137.15.22.212q.085.061.227.145t.174.106q.21.134.326.274"/></svg><span>Linux</span></span></NuxtLink>

      <NuxtLink href="https://web.dev/learn/pwa/progressive-web-apps"><span class="max-w-fit dark:bg-white/5 bg-black/5 p-1.5 rounded-xl px-2.5 flex items-center "><svg xmlns="http://www.w3.org/2000/svg" width="26" class="mr-1 inline" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M1 18q.225-2.675 1.638-4.925T6.4 9.5L4.55 6.3q-.15-.225-.075-.475T4.8 5.45q.2-.125.45-.05t.4.3L7.5 8.9Q9.65 8 12 8t4.5.9l1.85-3.2q.15-.225.4-.3t.45.05q.25.125.325.375t-.075.475L17.6 9.5q2.35 1.325 3.762 3.575T23 18zm6-2.75q.525 0 .888-.363T8.25 14t-.363-.888T7 12.75t-.888.363T5.75 14t.363.888t.887.362m10 0q.525 0 .888-.363T18.25 14t-.363-.888T17 12.75t-.888.363t-.362.887t.363.888t.887.362"/></svg><span>Android</span></span></NuxtLink>

      <NuxtLink href="https://web.dev/learn/pwa/progressive-web-apps"><span class="max-w-fit dark:bg-white/5 bg-black/5 p-1.5 rounded-xl px-2.5 flex items-center "><svg xmlns="http://www.w3.org/2000/svg" width="26" class="mr-1 inline" viewBox="0 0 24 24"><!-- Icon from Lineicons by Lineicons - https://github.com/LineiconsHQ/Lineicons/blob/main/LICENSE.md --><path fill="currentColor" d="M20.64 5.396c-.169-.444-.574-1.069-1.148-1.513c-.337-.253-.72-.5-1.26-.658C17.649 3.056 16.928 3 16.05 3h-8.1c-.883 0-1.598.056-2.177.23c-.54.164-.94.406-1.265.659a3.8 3.8 0 0 0-1.154 1.513C3.006 6.296 3 7.309 3 7.95v8.1c0 .641.006 1.654.354 2.554a3.83 3.83 0 0 0 2.42 2.171c.579.169 1.293.225 2.176.225h8.1c.883 0 1.598-.056 2.177-.23c.54-.164.94-.406 1.265-.659a3.8 3.8 0 0 0 1.154-1.513c.354-.894.354-1.912.354-2.554v-8.1c0-.64-.006-1.653-.354-2.553zM6.566 15.375h-.67v-4h.67zm-.332-4.674a.415.415 0 1 1 0-.832a.42.42 0 0 1 .422.415a.424.424 0 0 1-.422.417m4.022 4.775c-1.766 0-2.88-1.26-2.88-3.268s1.114-3.274 2.88-3.274c1.767 0 2.88 1.266 2.88 3.274s-1.113 3.268-2.88 3.268m5.828 0c-1.328 0-2.261-.731-2.323-1.822h.602c.067.76.781 1.277 1.777 1.277c.95 0 1.631-.518 1.631-1.232c0-.59-.41-.945-1.35-1.181l-.787-.203c-1.176-.298-1.699-.793-1.699-1.631c0-1.024.922-1.755 2.171-1.755c1.238 0 2.138.731 2.177 1.738h-.602c-.056-.714-.692-1.193-1.592-1.193c-.877 0-1.53.49-1.53 1.187c0 .546.394.867 1.328 1.103l.686.174c1.277.32 1.811.81 1.811 1.693c0 1.114-.894 1.845-2.3 1.845m-3.56-3.268c0 1.66-.878 2.711-2.268 2.711s-2.261-1.052-2.261-2.71c0-1.666.872-2.718 2.261-2.718s2.267 1.052 2.267 2.717"/></svg><span>iOS</span></span></NuxtLink>


    </ul>
  </UiBlurReveal>
</ClientOnly></div>

<div class="text-xl dark:bg-white/5 items-center py-6 px-2 flex justify-center dark:text-white">
  <ClientOnly><UiBlurReveal
    :delay="0.1"
    :duration="0.75"
  ><div class="flex w-full p-3 text-xl opacity-95"><span data-name="heart" data-type="emoji" class="inline-flex gap-2">Made with<img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/2764-fe0f.png" draggable="false" loading="lazy" align="absmiddle" class="w-[22px] max-h-fit"><span>by <NuxtLink href="https://github.com/imrofayel/">Adam Rofayel</NuxtLink>.</span></span></div></UiBlurReveal></ClientOnly>
</div>

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'

const stars = ref<number|null>(150)

onMounted(async () => {
  try {
    const res = await fetch('https://api.github.com/repos/imrofayel/fylepad')
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
    const data = await res.json()
    stars.value = data.stargazers_count
  } catch (e) {
    console.error('Error fetching GitHub stars', e)
  }
})

const colorMode = useColorMode()

function onClick(val: string) {
  colorMode.preference = val
}

</script>

<style>

</style>