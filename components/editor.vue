<template>

  <UseDraggable class="absolute flex w-full items-center justify-center" style="user-select: none">
    <div class="w-full flex justify-center cursor-move z-[40] items-center">
      <div
        class="m-8 top-0 p-4 rounded-2xl border justify-center items-center fixed border-gray-200 dark:border-none drop-shadow-cool dark:bg-[#2d3d33] bg-white z-[100] flex flex-col space-y-6"
        v-if="showSearch">

        <section class="flex gap-2">
          <div
            class="absolute -right-[4px] -top-2 z-10 bg-[#e01212] hover:bg-[#cc1212] border-[#bb1212] border w-6 h-6 flex items-center justify-center text-lg text-white rounded-lg cursor-pointer"
            @click="toggleSearch">&times;</div>
          <div>
            <div
              class="mt-1 p-2 bg-white border dark:border-none border-gray-200 rounded-xl dark:bg-[#171f18] drop-shadow-cool text-black dark:text-white/90 flex justify-center">
              <Input v-model="searchTerm" @keydown.enter.prevent="updateSearchReplace" type="text" placeholder="Search"
                autofocus="true"
                class="placeholder:text-gray-400 dark:placeholder:text-gray-200/80 bg-transparent outline-none" />

              <button title="Case Sensitive" @click="toggleCase" class="px-1.5"
                :class="caseSensitive ? 'text-gray-700' : 'opacity-40 dark:opacity-50'">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" class="drop-shadow-sm">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="1.5"
                    d="m14 19l-2.893-8.252C9.763 6.916 9.092 5 8 5s-1.763 1.916-3.107 5.748L2 19m2.5-7h7m10.47 1.94v4.5m0-4.5c.046-.824.048-1.45-.05-1.963c-.234-1.206-1.494-1.933-2.714-2.081c-1.168-.142-2.104.159-3.052 1.54m5.815 2.503h-2.843c-.437 0-.878.021-1.299.138c-2.573.716-2.384 4.323.196 4.768c.287.05.58.07.87.058c.677-.03 1.302-.358 1.84-.773c.627-.486 1.236-1.165 1.236-2.19z"
                    color="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <div class="mt-1">
              <input v-model="replaceTerm" @keydown.enter.prevent="replace" type="text" placeholder="Replace"
                class="mt-1 p-2 bg-white border dark:border-none border-gray-200 rounded-xl dark:bg-[#171f18] drop-shadow-cool text-black dark:text-white/90 flex justify-center outline-none focus:outline-none" />
            </div>
          </div>

        </section>

        <div class="flex justify-between w-full items-center"><span
            class="inline-flex rounded-md isolate bg-white !text-[15px] drop-shadow-cool">
            <button @click="previous" type="button"
              class="mt-1 p-2 px-3 border dark:border-none border-gray-200 rounded-xl rounded-r-none bg-gray-50/30 dark:bg-[#171f18]  text-gray-800 dark:text-white/90 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                class="drop-shadow-sm">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </button>
            <button @click="next" type="button"
              class="mt-1 p-2 px-3 border-x-0 bg-gray-50/30 border dark:border-none border-gray-200  dark:bg-[#171f18] text-gray-800 dark:text-white/90 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                class="drop-shadow-sm">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            <button @click="replace" type="button"
              class="mt-1 p-2 px-3 bg-gray-50/30 border dark:border-none border-gray-200 dark:bg-[#171f18] text-gray-800 dark:text-white/90 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                class="drop-shadow-sm" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 4a2 2 0 0 1 2-2" />
                <path d="M16 10a2 2 0 0 1-2-2" />
                <path d="M20 2a2 2 0 0 1 2 2" />
                <path d="M22 8a2 2 0 0 1-2 2" />
                <path d="m3 7 3 3 3-3" />
                <path d="M6 10V5a3 3 0 0 1 3-3h1" />
                <rect x="2" y="14" width="8" height="8" rx="2" />
              </svg>
            </button>
            <button @click="replaceAll" type="button"
              class="mt-1 p-2 px-3 border-x-0 bg-gray-50/30 border dark:border-none border-gray-200 border-r rounded-r-xl dark:bg-[#171f18] text-gray-800 dark:text-white/90 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                class="drop-shadow-sm">
                <path d="M14 14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2" />
                <path d="M14 4a2 2 0 0 1 2-2" />
                <path d="M16 10a2 2 0 0 1-2-2" />
                <path d="M20 14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2" />
                <path d="M20 2a2 2 0 0 1 2 2" />
                <path d="M22 8a2 2 0 0 1-2 2" />
                <path d="m3 7 3 3 3-3" />
                <path d="M6 10V5a 3 3 0 0 1 3-3h1" />
                <rect x="2" y="14" width="8" height="8" rx="2" />
              </svg>
            </button>

          </span>

          <div class="block text-[18px] drop-shadow-sm text-black dark:text-white/90 py-2 px-4">
            Results: {{ editor?.storage?.searchAndReplace?.resultIndex + 1 }} / {{
              editor?.storage?.searchAndReplace?.results.length }}
          </div>
        </div>
      </div>
    </div>
  </UseDraggable>

  <div class="h-full flex flex-col tiptap">

    <div class="flex space-x-2 fixed right-0 top-1 z-[12] py-2"
      :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">

      <button
        class="border border-gray-200 bg-white/80 text-gray-800/90 !px-[7px] rounded-2xl justify-center items-center cursor-pointer !py-[6px] inline-block drop-shadow-cool"
        @click="toggleSearch"><svg width="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
          class="drop-shadow-sm">
          <path d="M17 17L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            vector-effect="non-scaling-stroke"></path>
          <path
            d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path>
        </svg></button>


      <button @click="exportMarkdown" :class="[
        'border border-gray-200 bg-white/80 text-gray-800/90 !px-[7px] rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]">
        <svg xmlns="http://www.w3.org/2000/svg" width="23" viewBox="0 0 24 24" class="drop-shadow-sm">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            color="currentColor">
            <path d="M3.095 10Q3 10.687 3 11.4c0 5.302 4.03 9.6 9 9.6s9-4.298 9-9.6q0-.714-.095-1.4" />
            <path d="M12 13V3m0 10c-.7 0-2.008-1.994-2.5-2.5M12 13c.7 0 2.008-1.994 2.5-2.5" />
          </g>
        </svg>
      </button>

      <button @click="importMarkdownOrText" :class="[
        'border border-gray-200 bg-white/80 text-gray-800/90 !px-[7px]  rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]">
        <svg width="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-sm">
          <path d="M9.5 14.5L14.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            vector-effect="non-scaling-stroke"></path>
          <path
            d="M16.8463 14.6095L19.4558 12C21.5147 9.94112 21.5147 6.60302 19.4558 4.54415C17.397 2.48528 14.0589 2.48528 12 4.54415L9.39045 7.1537M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.3969 2.48528 14.0588 4.54416 12L7.1537 9.39045"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
        </svg>
      </button>

      <button @click="onClick('light')" v-if="colorMode.value == 'dark'" :class="[
        'border border-gray-200 bg-white/80 text-gray-800/90 !px-[7px]  rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]">
        <svg xmlns="http://www.w3.org/2000/svg" width="23" viewBox="0 0 24 24" class="drop-shadow-sm">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M21.5 14.078A8.557 8.557 0 0 1 9.922 2.5C5.668 3.497 2.5 7.315 2.5 11.873a9.627 9.627 0 0 0 9.627 9.627c4.558 0 8.376-3.168 9.373-7.422"
            color="currentColor" />
        </svg>

      </button>

      <button @click="onClick('light')" v-if="colorMode.value == 'light'" :class="[
        'border border-gray-200 bg-white/80 text-gray-800/90 !px-[7px]  rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]">
        <svg width="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-sm">
          <path d="M17 12a5 5 0 11-10 0 5 5 0 0110 0z" stroke="currentColor" stroke-width="1.5"
            vector-effect="non-scaling-stroke"></path>
          <path
            d="M12 2c-.377.333-.905 1.2 0 2m0 16c.377.333.905 1.2 0 2m7.5-17.497c-.532-.033-1.575.22-1.496 1.495M5.496 17.5c.033.532-.22 1.575-1.496 1.496M5.003 4.5c-.033.532.22 1.576 1.497 1.497M18 17.503c.532-.032 1.575.208 1.496 1.414M22 12c-.333-.377-1.2-.905-2 0m-16-.5c-.333.377-1.2.905-2 0"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
        </svg>
      </button>

      <button @click="isBottomSheetOpen = true" :class="[
        'border border-gray-200 bg-white/80 text-gray-800/90 !px-[7px]  rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" class="drop-shadow-sm">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            color="currentColor">
            <path
              d="M6 22v-8.306c0-1.565 0-2.348.215-3.086c.214-.739.63-1.39 1.465-2.693l2.656-4.15C11.088 2.587 11.465 2 12 2s.912.588 1.664 1.764l2.656 4.151c.834 1.303 1.25 1.954 1.465 2.693c.215.738.215 1.52.215 3.086V22" />
            <path
              d="M7 11c.632.323 1.489.973 2.28 1c1.019.032 1.707-.863 2.72-.863s1.701.895 2.72.862c.791-.026 1.649-.676 2.28-.999m-5 1v10M10 5h4" />
          </g>
        </svg>
      </button>

      <UiBottomSheet :isOpen="isBottomSheetOpen" @close="isBottomSheetOpen = false" :editor="editor as any" />

    </div>

    <div class="flex fixed justify-between w-full p-2 py-0 pt-4 bg-white z-10" v-show="!focusMode">

      <div class="flex w-full justify-between items-center space-x-2">
        <input v-model="localTitle" @input="$emit('update:title', localTitle)" placeholder="Untitled"
          class="w-full border border-none ring-0 focus:border-none px-3 dark:text-white text-black/90 outline-none bg-transparent rounded flex text-[24px]" />


        <button
          class="border border-gray-200 bg-white text-gray-800 !px-[8px] py-[7px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool"
          title="Print" @click="focus"><svg xmlns="http://www.w3.org/2000/svg" width="22.5" viewBox="0 0 24 24"
            class="drop-shadow-sm">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              color="currentColor">
              <path
                d="M7.354 18c-2.123 0-3.185 0-3.94-.453a3.04 3.04 0 0 1-1.15-1.223c-.392-.77-.287-1.787-.075-3.822c.176-1.698.264-2.547.698-3.171c.285-.41.67-.745 1.121-.977C4.695 8 5.582 8 7.354 8h9.292c1.772 0 2.659 0 3.346.354c.451.232.836.567 1.121.977c.434.624.522 1.473.698 3.172c.212 2.034.317 3.052-.076 3.821a3.04 3.04 0 0 1-1.148 1.223C19.83 18 18.769 18 16.646 18M17 8V6c0-1.886 0-2.828-.586-3.414S14.886 2 13 2h-2c-1.886 0-2.828 0-3.414.586S7 4.114 7 6v2" />
              <path
                d="M13.989 16H10.01c-.685 0-1.028 0-1.32.109a1.87 1.87 0 0 0-.945.8c-.168.281-.251.642-.417 1.363c-.26 1.128-.39 1.691-.301 2.143c.117.602.484 1.112.995 1.382c.382.203.918.203 1.988.203h3.978c1.07 0 1.606 0 1.988-.203c.51-.27.878-.78.995-1.382c.089-.452-.041-1.015-.3-2.143c-.167-.72-.25-1.082-.418-1.362a1.87 1.87 0 0 0-.946-.801C15.017 16 14.674 16 13.988 16M18 12h.009" />
            </g>
          </svg></button>


      </div>
    </div>

    <div class="flex-grow mt-12">

      <floating-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div
          class="flex overflow-hidden bg-white dark:bg-[#2d3d33] dark:border-none border-gray-200 rounded-xl border text-gray-800 dark:text-white/85 relative left-[5rem]">
          <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('heading', { level: 1 }) }"
            class="rounded-l-lg hover:bg-gray-100 hover:dark:bg-[#1f2920] p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 12h8m-8 6V6m8 12V6m5 6l3-2v8" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleBulletList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('bulletList') }"
            class="hover:bg-gray-100 p-2 px-2 hover:dark:bg-[#1f2920]">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('orderedList') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6h11m-11 6h11m-11 6h11M4 6h1v4m-1 0h2m0 8H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleTaskList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('taskList', { level: 1 }) }"
            class="hover:bg-gray-100 hover:dark:bg-[#1f2920] p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
                <path d="M14 4h7m-7 5h7m-7 6h7m-7 5h7" />
              </g>
            </svg>

          </button>

          <button @click="editor.chain().focus().toggleCode().run()"
            :class="{ 'dark:bg-[#1f2920] bg-gray-100': editor.isActive('code') }"
            class="hover:bg-gray-100 p-2 px-2 hover:dark:bg-[#1f2920]">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="m16 18l6-6l-6-6M8 6l-6 6l6 6" />
            </svg>

          </button>
        </div>
      </floating-menu>

      <bubble-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div
          class="flex overflow-hidden dark:bg-[#2d3d33] dark:border-none bg-white border border-gray-200 rounded-xl text-gray-800 drop-shadow-cool dark:text-white/85">
          <button @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('bold') }"
            class="rounded-l-lg hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-gray-200/50 dark:bg-[#1f2920]': editor.isActive('italic') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 4h-9m4 16H5M15 4L9 20" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('strike') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">


            <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6m-2-8h16" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleHighlight().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('highlight') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2 rounded-r-lg">
            <div class="w-5 h-5 bg-yellow-400 dark:bg-yellow-500 rounded-full border dark:border-none border-black/50">
            </div>
          </button>
        </div>
      </bubble-menu>

      <EditorContent :editor="editor as any" class="h-full overflow-auto mb-4 px-4" />

      <div class="p-3 flex justify-between items-center fixed bottom-0 w-full select-none" v-if="editor"
        :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">
        <div class="flex space-x-4">

          <div class="flex space-x-4" v-if="!editor.can().deleteTable()">

            <div @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
              class="border border-gray-200 bg-gray-50 backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24" class="drop-shadow-sm">
                <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  color="currentColor">
                  <path
                    d="M12 21c.28 0 .539-.127 1.058-.382l4.172-2.044C19.077 17.669 20 17.216 20 16.5v-9M12 21c-.28 0-.539-.127-1.058-.382L6.77 18.574C4.923 17.669 4 17.216 4 16.5v-9M12 21v-9" />
                  <path
                    d="M10.942 3.382C11.462 3.127 11.721 3 12 3c.28 0 .539.127 1.058.382l4.172 2.044C19.077 6.331 20 6.784 20 7.5s-.923 1.169-2.77 2.074l-4.172 2.044c-.52.255-.779.382-1.058.382c-.28 0-.539-.127-1.058-.382L6.77 9.574C4.923 8.669 4 8.216 4 7.5s.923-1.169 2.77-2.074z" />
                </g>
              </svg><span class="drop-shadow-sm">Table</span>
            </div>

          </div>

          <!-- Row Manipulation -->

          <div class="flex space-x-2" v-if="editor.can().deleteTable()">

            <div
              class="border border-gray-200 bg-gray-50 backdrop-blur-xl text-black !px-[7px] py-[6px] rounded-2xl justify-center items-center cursor-pointer flex drop-shadow-cool space-x-1">

              <button @click="editor.chain().focus().deleteRow().run()" :disabled="!editor.can().deleteRow()">

                <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24" class="text-red-600">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M5 12h14" />
                </svg>

              </button>

              <span class="inline">Row</span>

              <button @click="editor.chain().focus().addRowAfter().run()" :disabled="!editor.can().addRowAfter()"
                class="text-gray-800">

                <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M5 12h14m-7-7v14" />
                </svg>

              </button>

            </div>

            <!-- Column Manipulation -->

            <div class="flex space-x-2" v-if="editor.can().deleteTable()">

              <div
                class="border border-gray-200 bg-gray-50 backdrop-blur-xl text-black !px-[7px] py-[6px] rounded-2xl justify-center items-center cursor-pointer flex drop-shadow-cool space-x-1">

                <button @click="editor.chain().focus().deleteColumn().run()" :disabled="!editor.can().deleteColumn()">

                  <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24" class="text-red-600">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M5 12h14" />
                  </svg>

                </button>

                <span class="inline">Column</span>


                <button @click="editor.chain().focus().addColumnAfter().run()"
                  :disabled="!editor.can().addColumnAfter()" class="text-gray-800">

                  <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M5 12h14m-7-7v14" />
                  </svg>

                </button>

              </div>
            </div>

            <div @click="editor.chain().focus().toggleHeaderCell().run()" :disabled="!editor.can().toggleHeaderCell()"
              class="border border-gray-200 bg-gray-50 backdrop-blur-xl text-black !px-[10px] py-[6px] rounded-2xl justify-center items-center cursor-pointer flex drop-shadow-cool space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"
                class="drop-shadow-sm text-gray-800">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M3.891 3.891C5.282 2.5 7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12c0-4.478 0-6.718 1.391-8.109"
                  color="currentColor" />
              </svg>
              <span>Header Cell</span>
            </div>

            <div @click="editor.chain().focus().deleteTable().run()"
              class="text-base bg-[#e01212] hover:bg-[#cc1212] border-[#bb1212] border backdrop-blur-xl text-white !px-[10px] py-[6px] rounded-2xl justify-center items-center cursor-pointer flex drop-shadow-cool space-x-1.5">

              <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="m19.5 5.5l-.62 10.025c-.158 2.561-.237 3.842-.88 4.763a4 4 0 0 1-1.2 1.128c-.957.584-2.24.584-4.806.584c-2.57 0-3.855 0-4.814-.585a4 4 0 0 1-1.2-1.13c-.642-.922-.72-2.205-.874-4.77L4.5 5.5M3 5.5h18m-4.944 0l-.683-1.408c-.453-.936-.68-1.403-1.071-1.695a2 2 0 0 0-.275-.172C13.594 2 13.074 2 12.035 2c-1.066 0-1.599 0-2.04.234a2 2 0 0 0-.278.18c-.395.303-.616.788-1.058 1.757L8.053 5.5"
                  color="currentColor" />
              </svg>

              <span>Delete</span>
            </div>

          </div>

        </div>
        <div class="sm:hidden md:flex items-center space-x-2 hidden text-onPrimaryContainer relative right-11">

          <div
            class="border border-gray-200 bg-gray-50 backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool">
            {{ characterCount }} characters</div>
          <div
            class="border border-gray-200 bg-gray-50 backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool">
            {{ wordCount }} words</div>
        </div>
      </div>

      <button
        class="fixed bottom-3 mx-2 right-0 border border-gray-200 bg-gray-50 backdrop-blur-xl text-gray-800 !px-[8px] py-[7px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool"
        title="Focus Mode" @click="focus"><svg xmlns="http://www.w3.org/2000/svg" width="23" viewBox="0 0 24 24"
          class="drop-shadow-sm">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            color="currentColor">
            <path
              d="M16.613 16.085C13.98 17.568 12.477 20.64 12 21.5V8c.415-.746 1.602-2.884 3.632-4.336c.855-.612 1.282-.918 1.825-.64c.543.28.543.896.543 2.127v8.84c0 .666 0 .999-.137 1.232c-.136.234-.508.443-1.25.862" />
            <path
              d="M12 7.806c-.687-.722-2.678-2.436-6.02-3.036c-1.692-.305-2.538-.457-3.26.126C2 5.48 2 6.426 2 8.321v6.809c0 1.732 0 2.598.463 3.139c.462.54 1.48.724 3.518 1.09c1.815.326 3.232.847 4.258 1.37c1.01.514 1.514.771 1.761.771s.752-.257 1.76-.771c1.027-.523 2.444-1.044 4.26-1.37c2.036-.366 3.055-.55 3.517-1.09c.463-.541.463-1.407.463-3.14V8.322c0-1.894 0-2.841-.72-3.425C20.557 4.313 19 4.77 18 5.5" />
          </g>
        </svg></button>

      <button
        class="fixed bottom-3 border border-gray-200 bg-gray-50 backdrop-blur-xl text-gray-800 !px-[8px] py-[7px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool right-[60px]"
        title="Print" v-if="focusMode" @click="printPDF"><svg xmlns="http://www.w3.org/2000/svg" width="23"
          viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            color="currentColor">
            <path
              d="M7.354 18c-2.123 0-3.185 0-3.94-.453a3.04 3.04 0 0 1-1.15-1.223c-.392-.77-.287-1.787-.075-3.822c.176-1.698.264-2.547.698-3.171c.285-.41.67-.745 1.121-.977C4.695 8 5.582 8 7.354 8h9.292c1.772 0 2.659 0 3.346.354c.451.232.836.567 1.121.977c.434.624.522 1.473.698 3.172c.212 2.034.317 3.052-.076 3.821a3.04 3.04 0 0 1-1.148 1.223C19.83 18 18.769 18 16.646 18M17 8V6c0-1.886 0-2.828-.586-3.414S14.886 2 13 2h-2c-1.886 0-2.828 0-3.414.586S7 4.114 7 6v2" />
            <path
              d="M13.989 16H10.01c-.685 0-1.028 0-1.32.109a1.87 1.87 0 0 0-.945.8c-.168.281-.251.642-.417 1.363c-.26 1.128-.39 1.691-.301 2.143c.117.602.484 1.112.995 1.382c.382.203.918.203 1.988.203h3.978c1.07 0 1.606 0 1.988-.203c.51-.27.878-.78.995-1.382c.089-.452-.041-1.015-.3-2.143c-.167-.72-.25-1.082-.418-1.362a1.87 1.87 0 0 0-.946-.801C15.017 16 14.674 16 13.988 16M18 12h.009" />
          </g>
        </svg></button>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Editor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3';
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Color } from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import ListKeymap from '@tiptap/extension-list-keymap'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import FontFamily from '@tiptap/extension-font-family'

import { Mathematics } from '@tiptap-pro/extension-mathematics'
import Emoji, { gitHubEmojis } from '@tiptap-pro/extension-emoji'

import { SearchAndReplace } from "../extensions/search&replace.ts";
import { type Range as EditorRange } from '@tiptap/core'

import 'katex/dist/katex.min.css'

import { Markdown } from 'tiptap-markdown';

import { ColorHighlighter } from '../extensions/ColorHighlighter.ts'

import { SmilieReplacer } from '../extensions/SmilieReplacer.ts'

import { md2pdf } from '../utils/exportPDF';

// load all languages with "all" or common languages with "common"
import { all, createLowlight } from 'lowlight'

import { UseDraggable } from '@vueuse/components'

const isBottomSheetOpen = ref(false);

function printPDF() {
  window.print()
}

const colorMode = useColorMode()

function onClick(val: string) {
  colorMode.preference = val
}

const showSearch = ref(false);

function toggleSearch() {
  if (showSearch.value == true) {
    showSearch.value = false
    clear()
  }
  else {
    showSearch.value = true
  }
}

const focusMode = ref(false);

function focus() {
  if (focusMode.value == true) {
    focusMode.value = false,
      editor.value?.setEditable(true)
  }
  else {
    focusMode.value = true,
      editor.value?.setEditable(false)

  }
}

// create a lowlight instance
const lowlight = createLowlight(all)

const editor = ref<Editor | null>(null);

const CustomTaskItem = TaskItem.extend({
  content: 'inline*',
})

const props = defineProps<{
  title: string;
  content: any;
}>();

const emit = defineEmits(['update:title', 'update:content']);

const localTitle = ref(props.title);

onMounted(() => {
  editor.value = new Editor({
    content: props.content,

    editable: true,

    editorProps: {
      attributes: {
        class: 'dark:text-white/90 p-6 leading-loose py-2 !text-[#393939] text-[19px] min-h-[150px] w-full h-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 !opacity-100 geist',
      },
    },
    extensions: [
      CustomTaskItem,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle,
      Table.configure({ resizable: true }),
      Superscript,
      SubScript,
      Link,
      Typography,
      TableRow,
      TableHeader,
      TableCell,
      ListKeymap,
      StarterKit,
      Highlight,
      TaskList,
      FontFamily,
      Mathematics,
      SearchAndReplace.configure(),
      Link.configure({
        autolink: true,
      }),

      Emoji.configure({
        emojis: gitHubEmojis,
        forceFallbackImages: true,
        enableEmoticons: true
      }),

      CodeBlockLowlight.configure({
        lowlight,
      }),

      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskItem.configure({
        nested: true,
      }),
      Markdown,
      SmilieReplacer,
      ColorHighlighter,
      CharacterCount.configure({
        limit: Infinity,
      }),
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'heading'
          }
          if (node.type.name === 'paragraph') {
            return 'Begin!'
          }
          return ''
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      emit('update:content', editor.getJSON());
    },
  });
});

watch(() => props.title, (newTitle) => {
  localTitle.value = newTitle;
});

watch(() => props.content, (newContent) => {
  if (editor.value && JSON.stringify(newContent) !== JSON.stringify(editor.value.getJSON())) {
    editor.value.commands.setContent(newContent);
  }
}, { deep: true });

onBeforeUnmount(() => {
  editor.value?.destroy();
});

const exportMarkdown = () => {
  if (editor.value) {
    const markdownContent = editor.value.storage.markdown.getMarkdown();
    console.log('Markdown Content:', markdownContent);

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${localTitle.value || 'untitled'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    console.error('Editor instance is not available.');
  }
};

const importMarkdownOrText = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.txt';

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content = e.target?.result;
        if (typeof content === 'string' && editor.value) {
          editor.value.commands.setContent(content);
          console.log('Content imported successfully');

          // Update the title based on the file name (optional)
          const fileName = file.name.replace(/\.(md|txt)$/, '');
          if (localTitle && typeof localTitle.value === 'string') {
            localTitle.value = fileName;

            // Update the title using the file name
            emit('update:title', localTitle.value);
          }
        } else {
          console.error('Failed to import content: Invalid content or editor not available');
        }
      };

      reader.onerror = (e: ProgressEvent<FileReader>) => {
        console.error('Error reading file:', e);
      };

      reader.readAsText(file);
    } else {
      console.error('No file selected');
    }
  };

  input.click();
};

const characterCount = computed(() => editor.value?.storage.characterCount.characters() ?? 0);
const wordCount = computed(() => editor.value?.storage.characterCount.words() ?? 0);

const searchTerm = ref<string>("");

const replaceTerm = ref<string>("");

const caseSensitive = ref<boolean>(false);

function toggleCase() {
  if (caseSensitive.value == true) {
    caseSensitive.value = false;
    updateSearchReplace()
  } else {
    caseSensitive.value = true;
    updateSearchReplace()
  }
}

const updateSearchReplace = (clearIndex: boolean = false) => {
  if (!editor.value) return;

  if (clearIndex) editor.value.commands.resetIndex();

  editor.value.commands.setSearchTerm(searchTerm.value);
  editor.value.commands.setReplaceTerm(replaceTerm.value);
  editor.value.commands.setCaseSensitive(caseSensitive.value);
};

const goToSelection = () => {
  if (!editor.value) return;

  const { results, resultIndex } = editor.value.storage.searchAndReplace;
  const position: EditorRange = results[resultIndex];

  if (!position) return;

  editor.value.commands.setTextSelection(position);

  const { node } = editor.value.view.domAtPos(
    editor.value.state.selection.anchor
  );
  node instanceof HTMLElement &&
    node.scrollIntoView({ behavior: "smooth", block: "center" });
};

watch(
  () => searchTerm.value.trim(),
  (val, oldVal) => {
    if (!val) clear();
    if (val !== oldVal) updateSearchReplace(true);
  }
);

watch(
  () => replaceTerm.value.trim(),
  (val, oldVal) => (val === oldVal ? null : updateSearchReplace())
);

watch(
  () => caseSensitive.value,
  (val, oldVal) => (val === oldVal ? null : updateSearchReplace(true))
);

const replace = () => {
  editor.value?.commands.replace();
  goToSelection();
};

const next = () => {
  editor.value?.commands.nextSearchResult();
  goToSelection();
};

const previous = () => {
  editor.value?.commands.previousSearchResult();
  goToSelection();
};

const clear = () => {
  searchTerm.value = replaceTerm.value = "";
  editor.value!.commands.resetIndex();
};

const replaceAll = () => editor.value?.commands.replaceAll();

onMounted(() => {
  setTimeout(updateSearchReplace);

  // Add the event listener when the component is mounted
  document.addEventListener('keydown', handleShortcut);
});

onBeforeUnmount(() => {
  // Clean up the event listener to prevent memory leaks
  document.removeEventListener('keydown', handleShortcut);
});

function handleShortcut(event: KeyboardEvent) {
  // CTRL + F -> Open search
  if (event.ctrlKey && event.key === 'f') {
    event.preventDefault();
    toggleSearch();
  }

  if (event.ctrlKey && event.key === 'p') {
    event.preventDefault();
    window.print()
  }

  // CTRL + R -> Toggle focus mode
  if (event.ctrlKey && event.key === 'r') {
    event.preventDefault();
    focus()
  }

  // CTRL + O -> Open import
  if (event.ctrlKey && event.key === 'o') {
    event.preventDefault();
    importMarkdownOrText();
  }

  // CTRL + S -> Save (export markdown)
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    exportMarkdown();
  }

  if (event.ctrlKey && event.key === 't') {
    event.preventDefault();
    editor.value?.commands.insertTable({ rows: 3, cols: 3 })
  }
}

</script>

<style>
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  pre {
    border-radius: 0.8rem;
    font-family: 'Roboto Mono', monospace;
    margin: 1.5rem 0;
    padding: 0.6rem 1rem;
    @apply bg-[#fafcfb] border border-gray-200 dark:bg-[#2d3d33] inline-block px-8 pl-5;

    filter: drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.04));


    ::spelling-error {
      text-decoration: none;
    }

    ::grammar-error {
      text-decoration: none;
    }

    code {
      background: none;
      color: inherit;
      font-size: 1.1rem;
      padding: 0;
      font-family: 'Roboto Mono', monospace;
    }

    /* Code styling */
    .hljs-comment,
    .hljs-quote {
      @apply text-[#616161] dark:text-[#616161];
      /* Same color for both themes */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      @apply text-[#d32f2f] dark:text-[#f98181];
      /* Darker red for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      @apply text-[#e65100] dark:text-[#fbbc88];
      /* Darker orange for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      @apply text-[#33691e] dark:text-[#b9f18d];
      /* Darker green for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-title,
    .hljs-section {
      @apply text-[#f9a825] dark:text-[#faf594];
      /* Slightly darker yellow for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      @apply text-[#0277bd] dark:text-[#70cff8];
      /* Darker blue for light theme */
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-emphasis {
      font-style: italic;
      font-family: 'Roboto Mono', monospace;
    }

    .hljs-strong {
      font-weight: 700;
      font-family: 'Roboto Mono', monospace;
    }
  }
}

/* Basic editor styles */
.tiptap {

  /* First child margin */
  :first-child {
    margin-top: 0;
  }

  /* Table-specific styling */
  table {
    @apply rounded-2xl w-full overflow-hidden m-0 drop-shadow-sm;

    /* Adding rounded border with smooth corners */
    border: 1px solid rgba(0, 0, 0, 0.1);
    /* Light mode */
    @apply dark:border-white/20;
    /* Dark mode */
    border-radius: 1rem;
    /* Smooth rounded corners for the entire table */

    td,
    th {
      @apply border p-2 align-top relative;

      /* Adding transparent borders to cells */
      @apply border-black/10 dark:border-white/20;

      /* Ensure child elements have no bottom margin */
      >* {
        @apply mb-0;
      }
    }

    th {
      @apply font-normal text-left;

      /* Light and dark mode for table header */
      @apply bg-gray-50 dark:bg-[#1f2920];
    }

    /* Selected cell styling */
    .selectedCell:after {
      content: "";
      @apply absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none;

      /* Light and dark mode for selected cell */
      @apply bg-gray-100 dark:bg-[#182021];
    }

  }

  /* Table wrapper for horizontal scroll */
  .tableWrapper {
    @apply my-6 overflow-x-auto border-opacity-60 border;

    /* Applying rounded corners to the wrapper */
    border: 1px solid rgba(0, 0, 0, 0.1);
    /* Light mode */
    @apply dark:border-white/20;
    /* Dark mode */
    border-radius: 1rem;
    /* Smooth rounded corners for the wrapper */
  }

  /* Resize cursor */
  &.resize-cursor {
    @apply cursor-ew-resize;
  }
}


h1 {
  font-size: 2rem;
  margin: 1rem 0;
}

h2 {
  font-size: 1.75rem;
  margin: 0.75rem 0;
}

h3 {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

h4 {
  font-size: 1.25rem;
  margin: 0.25rem 0;
}

ul,
ol {
  margin-left: 1.5rem;
  padding-left: 1rem;
}

ul {
  list-style-type: disc;
}

ol {
  list-style-type: decimal;
}

li {
  margin: 0.5rem 0;
}

.task-list-item {
  display: flex;
  align-items: center;
}

.task-list-item input {
  margin-right: 0.5rem;
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
}

mark {
  @apply bg-[#c0fcd3] text-gray-700;
  border-radius: 0.6rem;
  padding: 0.1rem 0.3rem;
}

code {
  font-family: 'Roboto Mono';
  font-size: 18px;
  border-radius: 0.6rem;
  padding: 0.1rem 0.3rem;

  @apply bg-gray-200/70 dark:bg-[#516b53] dark:text-white/80 text-black/80
}

/* Color swatches */
.tiptap .color {
  white-space: nowrap;
}

.tiptap .color::before {
  background-color: var(--color);
  /* border: 1px solid rgba(128, 128, 128, 0.3); */
  border-radius: 10px;
  content: " ";
  display: inline-block;
  height: 1em;
  margin-bottom: 0.15em;
  margin-right: 0.3em;
  vertical-align: middle;
  width: 1em;
}

.tiptap p.is-editor-empty:first-child::before {
  color: #cdcdcd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  font-size: x-large;
  position: relative;
  top: -6px;
}

/* Task list specific styles */
ul[data-type="taskList"] {
  list-style: none;
  margin-left: 14px;
  padding: 0;
}

ul[data-type="taskList"] li {
  align-items: center;
  display: flex;
  margin-bottom: 0.5rem;
  /* Optional: Add space between tasks */
}

ul[data-type="taskList"] li>label {
  display: flex;
  align-items: center;
  user-select: none;
}

ul[data-type="taskList"] label>input[type="checkbox"] {
  cursor: pointer;
  appearance: none;
  /* Remove default appearance */
  width: 20px;
  height: 20px;
  border: 1px solid #eaeaea;
  /* Border to match background */
  border-radius: 8px;
  /* Rounded corners */
  margin-right: 0.5rem;
  /* Space between checkbox and text */
  position: relative;
}

ul[data-type="taskList"] label>input[type="checkbox"]:checked {
  @apply bg-[#24d86c] border-[#28c76d]
}

ul[data-type="taskList"] label>input[type="checkbox"]:checked::after {
  content: '✔';
  /* Checkmark symbol */
  color: white;
  font-size: 14px;
  display: block;
  text-align: center;
  line-height: 18px;
}

ul[data-type="taskList"] label>div {
  flex: 1 1 auto;
}

[data-type="emoji"] {
  img {
    height: 1.2em;
    width: 1.2em;
  }

  @apply inline-block relative top-1
}

.tiptap {
  display: flex;
  flex-direction: column;
  margin: 1em 0;
}

.tiptap .ProseMirror {
  outline: none !important;
  padding: 1em 2px;
}

.tiptap .ProseMirror .search-result {
  background-color: rgba(255, 217, 0, 0.5);
}

.tiptap .ProseMirror .search-result-current {
  background-color: rgba(13, 255, 0, 0.5);
}
</style>