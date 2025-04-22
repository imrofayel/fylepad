<template>

  <UseDraggable class="absolute flex w-full items-center justify-center" style="user-select: none">
    <div class="w-full flex justify-center cursor-move z-[40] items-center">
      <div
        class="m-8 top-0 p-4 rounded-2xl border justify-center items-center fixed dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 dark:border-none drop-shadow-cool bg-white z-[100] flex flex-col space-y-6"
        v-if="showSearch">

        <section class="flex gap-2">
          <div
            class="absolute -right-[4px] -top-2 z-10 bg-[#e01212] hover:bg-[#cc1212] border-[#bb1212] border w-6 h-6 flex items-center justify-center text-lg text-white rounded-lg cursor-pointer"
            @click="toggleSearch">&times;</div>
          <div>
            <div
              class="mt-1 p-2 px-3 bg-white border dark:border-none border-gray-200 rounded-xl dark:bg-[#171717] dark:border-[#484747] drop-shadow-cool text-black dark:text-white/90 flex justify-center">
              <Input v-model="searchTerm" @keydown.enter.prevent="updateSearchReplace" type="text" placeholder="Search"
                autofocus="true"
                class="placeholder:text-gray-400 dark:placeholder:text-gray-200/80 bg-transparent outline-none" />

              <button title="Case Sensitive" @click="toggleCase" class="px-1.5"
                :class="caseSensitive ? 'text-gray-700 dark:text-white' : 'opacity-40 dark:opacity-50'">
                <CaseSensitiveIcon />
              </button>
            </div>
          </div>

          <div>
            <div class="mt-1">
              <input v-model="replaceTerm" @keydown.enter.prevent="replace" type="text" placeholder="Replace"
                class="mt-1 p-2 px-3 dark:bg-[#171717] dark:border-[#484747] bg-white border dark:border-none border-gray-200 rounded-xl drop-shadow-cool text-black dark:text-white/90 flex justify-center outline-none focus:outline-none" />
            </div>
          </div>

        </section>

        <div class="flex justify-between w-full items-center"><span
            class="inline-flex rounded-md isolate !text-[15px] drop-shadow-cool">
            <button @click="previous" type="button"
              class="mt-1 p-2 px-3 border dark:border-none border-gray-200 rounded-xl rounded-r-none bg-gray-50/30 dark:bg-[#171717] dark:border-[#484747] text-black dark:text-white/90 flex justify-center">
              <ArrowLeftIcon />
            </button>
            <button @click="next" type="button"
              class="mt-1 p-2 px-3 border-x-0 bg-gray-50/30 border dark:border-none dark:bg-[#171717] dark:border-[#484747] border-gray-200  text-black dark:text-white/90 flex justify-center">
              <ArrowRightIcon />
            </button>
            <button @click="replace" type="button"
              class="mt-1 p-2 px-3 bg-gray-50/30 border dark:border-none border-gray-200 dark:bg-[#171717] dark:border-[#484747] text-black dark:text-white/90 flex justify-center">
              <ReplaceIcon />
            </button>
            <button @click="replaceAll" type="button"
              class="mt-1 p-2 px-3 border-x-0 bg-gray-50/30 border dark:border-none border-gray-200 border-r rounded-r-xl dark:bg-[#171717] dark:border-[#484747] text-black dark:text-white/90 flex justify-center">
              <ReplaceAllIcon />
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

  <div class="h-full flex flex-col tiptap dark:bg-[#171717]">

    <UiDropdownMenu>
      <UiDropdownMenuTrigger class="fixed !opacity-100 right-0 p-1.5 px-2.5 top-1 z-[12] block sm:hidden">
        <button :class="[
        'border dark:bg-[#404040] !py-[6px] dark:border-[#525252] dark:text-white opacity-100 border-gray-200 bg-white text-black !px-[7px] rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Menu">
          <MenuIcon />
      </button>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent class="flex flex-wrap gap-1.5 px-1.5 py-1 border dark:bg-[#404040] dark:border-[#525252] dark:text-white opacity-100 border-gray-200 bg-white text-black rounded-2xl justify-center items-center cursor-pointer  drop-shadow-cool mr-2">
        <UiDropdownMenuItem>
          <button @click="exportMarkdown" :class="[
        'border dark:bg-[#17171720] !py-[6px] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-[14px] justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Export Markdown">
        <ExportIcon />
      </button>
        </UiDropdownMenuItem>
        <UiDropdownMenuItem>
          <button @click="importMarkdownOrText" :class="[
        'border dark:bg-[#17171720] !py-[6px] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-[14px] justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Import Markdown">
        <ImportIcon />
      </button>
    </UiDropdownMenuItem>
        <UiDropdownMenuItem>
          <button @click="onClick('light')" v-if="colorMode.value == 'dark'" :class="[
        'border dark:bg-[#17171720] !py-[6px] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-[14px] justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Light Mode">
        <LightModeIcon />

      </button>

      <button @click="onClick('dark')" v-if="colorMode.value == 'light'" :class="[
        'border dark:bg-[#17171720] !py-[6px] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-[14px] justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Dark Mode">
        <DarkModeIcon />
      </button>

        </UiDropdownMenuItem>
        <UiDropdownMenuItem>      <button @click="isBottomSheetOpen = true" :class="[
        'border dark:bg-[#17171720] !py-[6px] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-[14px] justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Styling">
        <StylingIcon />
      </button>
</UiDropdownMenuItem>
<UiDropdownMenuItem>
  <button @click="open = true" :class="[
        'border dark:bg-[#17171720] !py-[6px] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-[14px] justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="About">
        <AboutIcon />
      </button>
</UiDropdownMenuItem>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <div class="space-x-2 fixed right-2 top-1 z-[12] py-2 hidden sm:flex"
      :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">

      <!-- <button
        class="border border-gray-200 bg-white text-black !px-[7px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 rounded-2xl justify-center items-center cursor-pointer !py-[6px] inline-block drop-shadow-cool"
        @click="toggleSearch"><svg width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
          class="drop-shadow-sm">
          <path d="M17 17L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            vector-effect="non-scaling-stroke"></path>
          <path
            d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path>
        </svg></button> -->


      <button @click="exportMarkdown" :class="[
        'border dark:bg-[#404040] !py-[6px] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Export Markdown">
        <ExportIcon />
      </button>

      <button @click="importMarkdownOrText" :class="[
        'border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px]  rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Import Markdown">
        <ImportIcon />
      </button>

      <button @click="onClick('light')" v-if="colorMode.value == 'dark'" :class="[
        'border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px]  rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Light Mode">
        <LightModeIcon />

      </button>

      <button @click="onClick('dark')" v-if="colorMode.value == 'light'" :class="[
        'border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px]  rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Dark Mode">
        <DarkModeIcon />
      </button>

      <button @click="isBottomSheetOpen = true" :class="[
        'border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="Styling">
        <StylingIcon />
      </button>

      <button @click="open = true" :class="[
        'border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white text-black !px-[7px] rounded-2xl justify-center items-center cursor-pointer inline-block drop-shadow-cool'
      ]" title="About">
        <svg xmlns="http://www.w3.org/2000/svg" width="22.5" viewBox="0 0 24 24" class="drop-shadow-sm"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor"><path d="M10.456 2.64a2.18 2.18 0 0 1 3.088 0l1.009 1.011c.41.41.966.64 1.545.64h1.429a2.18 2.18 0 0 1 2.183 2.182l-.001 1.429c0 .58.23 1.135.64 1.545l1.01 1.01a2.18 2.18 0 0 1 0 3.087l-1.01 1.009c-.41.41-.64.966-.64 1.545v1.429a2.18 2.18 0 0 1-2.182 2.183l-1.429-.001c-.58 0-1.135.23-1.545.64l-1.01 1.01a2.18 2.18 0 0 1-3.087 0l-1.009-1.01a2.18 2.18 0 0 0-1.545-.64H6.473a2.18 2.18 0 0 1-2.183-2.182l.001-1.429c0-.58-.23-1.135-.64-1.545l-1.01-1.01a2.18 2.18 0 0 1 0-3.087l1.01-1.009c.41-.41.64-.966.64-1.545V6.473A2.18 2.18 0 0 1 6.472 4.29l1.429.001c.58 0 1.135-.23 1.545-.64z"/><path d="M10 9a2 2 0 1 1 3.683 1.08C13.085 11.01 12 11.896 12 13v.5m-.008 3.5h.009"/></g></svg>
      </button>

    </div>

    <div class="flex fixed justify-between w-full p-2 py-0 pt-4 bg-white dark:bg-[#171717] z-10">

      <div class="flex w-full justify-between items-center space-x-2">
        <input v-model="localTitle" @input="$emit('update:title', localTitle)" placeholder="Untitled"
          class="w-full border border-none ring-0 focus:border-none px-3 dark:text-white text-black/90 outline-none bg-transparent rounded flex text-[24px]" />

        <button
          class="border border-gray-200 bg-white text-black !px-[8px] dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 py-[7px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool"
          title="Print" @click="focus" v-if="!focusMode"><svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor"><path d="M3.5 10c0-3.771 0-5.657 1.245-6.828S7.993 2 12 2h.773c3.26 0 4.892 0 6.024.798c.324.228.612.5.855.805c.848 1.066.848 2.6.848 5.67v2.545c0 2.963 0 4.445-.469 5.628c-.754 1.903-2.348 3.403-4.37 4.113c-1.257.441-2.83.441-5.98.441c-1.798 0-2.698 0-3.416-.252c-1.155-.406-2.066-1.263-2.497-2.35c-.268-.676-.268-1.523-.268-3.216z"/><path d="M20.5 12a3.333 3.333 0 0 1-3.333 3.333c-.666 0-1.451-.116-2.098.057a1.67 1.67 0 0 0-1.179 1.179c-.173.647-.057 1.432-.057 2.098A3.333 3.333 0 0 1 10.5 22M8 7h7m-7 4h3"/></g></svg></button>


      </div>
    </div>

    <UiBottomSheet :isOpen="isBottomSheetOpen" @close="isBottomSheetOpen = false" :editor="editor as any" />

    <div class="flex-grow mt-12">

      <UiFloatingMenu :editor="editor as any"/>

      <UiBubbleMenu :editor="editor as any"/>

      <EditorContent :editor="editor as any" class="h-full overflow-auto mb-4 px-4" />

      <div class="p-3 flex justify-between items-center fixed bottom-0 w-full select-none" v-if="editor"
        :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">

        <div>

          <UiDropdownMenu v-if="!editor.can().deleteTable()">
            <UiDropdownMenuTrigger>
              <button
                  class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool sm:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" class="drop-shadow-sm" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10Q2-2 2 6t5 8q-5 3-1 6t6-3q2 6 6 3t-1-6q5 0 5-8t-10 4"/></svg><span class="drop-shadow-sm pl-0.5">Tools</span>
                </button>
            </UiDropdownMenuTrigger>

            <UiDropdownMenuContent class="flex flex-wrap gap-1.5 px-1.5 py-1 border dark:bg-[#404040] dark:border-[#525252] dark:text-white opacity-100 border-gray-200 bg-white text-black rounded-2xl justify-center items-center cursor-pointer  drop-shadow-cool ml-3 mb-1 sm:hidden">
              <UiDropdownMenuItem>
                <button @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
                  class="border dark:bg-[#17171720] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center text-[16.5px]  space-x-1 cursor-pointer flex drop-shadow-cool">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 16 16" class="drop-shadow-sm"><path fill="currentColor" fill-rule="evenodd" d="M12 3.5H4A1.5 1.5 0 0 0 2.5 5v.5h11V5A1.5 1.5 0 0 0 12 3.5M2.5 11V7h2v5.5H4A1.5 1.5 0 0 1 2.5 11M6 12.5h6a1.5 1.5 0 0 0 1.5-1.5V7H6zM4 2a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3z" clip-rule="evenodd"/></svg><span class="drop-shadow-sm px-0.5">Table</span>
                </button>
              </UiDropdownMenuItem>

              <UiDropdownMenuItem>
                <div @click="editor.commands.setMermaid('graph TD;\n  A-->B;  A-->C;\n  B-->D;\n  C-->D;')"

            class="border dark:bg-[#17171720] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center text-[16.5px]  space-x-1 cursor-pointer flex drop-shadow-cool">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 16 16" class="drop-shadow-sm"><path fill="currentColor" fill-rule="evenodd" d="M11.5 12.5A1.5 1.5 0 0 1 10 14H6a1.5 1.5 0 0 1-1.5-1.5v-.823a3.11 3.11 0 0 0-1.35-2.566A6.11 6.11 0 0 1 .5 4.073V3A1.5 1.5 0 0 1 2 1.5h.666A6.43 6.43 0 0 1 8 4.343A6.43 6.43 0 0 1 13.334 1.5H14A1.5 1.5 0 0 1 15.5 3v1.073a6.11 6.11 0 0 1-2.65 5.038a3.11 3.11 0 0 0-1.35 2.566zm-8-9.43a4.92 4.92 0 0 1 3.738 3.025c.275.688 1.249.688 1.524 0A4.92 4.92 0 0 1 13.334 3H14v1.073q0 .215-.02.427A4.61 4.61 0 0 1 12 7.875c-1.252.86-2 2.283-2 3.802v.823H6v-.823c0-1.52-.748-2.941-2-3.802a4.61 4.61 0 0 1-2-3.802V3h.666q.425 0 .834.07" clip-rule="evenodd"/></svg><span class="drop-shadow-sm px-0.5">Mermaid</span>
            </div>
              </UiDropdownMenuItem>

              <UiDropdownMenuItem>
                <div @click="editor.commands.setPlantuml('@startuml\nBob -> Alice : hello\n@enduml')"

            class="border dark:bg-[#17171720] dark:border-[#52525280] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center text-[16.5px]  space-x-1 cursor-pointer flex drop-shadow-cool">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 16 16" class="drop-shadow-sm"><path fill="currentColor" fill-rule="evenodd" d="M5.731 4H4.5A1.5 1.5 0 0 0 3 5.5v.377a2.72 2.72 0 0 1 0 5.246v.377A1.5 1.5 0 0 0 4.5 13h.377a2.72 2.72 0 0 1 5.246 0h.377a1.5 1.5 0 0 0 1.5-1.5v-1.232l1-.353a1.501 1.501 0 0 0 0-2.83l-1-.354V5.5A1.5 1.5 0 0 0 10.5 4H9.269l-.354-1a1.501 1.501 0 0 0-2.83 0zM8.9 14.5l-.204-1.02a1.22 1.22 0 0 0-2.392 0L6.1 14.5H4.5a3 3 0 0 1-3-3V9.9l1.02-.204a1.22 1.22 0 0 0 0-2.392L1.5 7.1V5.5a3 3 0 0 1 3-3h.17a3.001 3.001 0 0 1 5.66 0h.17a3 3 0 0 1 3 3v.17a3.001 3.001 0 0 1 0 5.66v.17a3 3 0 0 1-3 3z" clip-rule="evenodd"/></svg><span class="drop-shadow-sm scroll-px-0.5">Plant UML</span>
            </div>
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>

          <div class="space-x-2 hidden sm:flex" v-if="!editor.can().deleteTable()">

            <div @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
              class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-cwenter space-x-1 cursor-pointer flex drop-shadow-cool">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" viewBox="0 0 16 16" class="drop-shadow-sm"><path fill="currentColor" fill-rule="evenodd" d="M12 3.5H4A1.5 1.5 0 0 0 2.5 5v.5h11V5A1.5 1.5 0 0 0 12 3.5M2.5 11V7h2v5.5H4A1.5 1.5 0 0 1 2.5 11M6 12.5h6a1.5 1.5 0 0 0 1.5-1.5V7H6zM4 2a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3z" clip-rule="evenodd"/></svg><span class="drop-shadow-sm">Table</span>
            </div>

            <div @click="editor.commands.setMermaid('graph TD;\n  A-->B;  A-->C;\n  B-->D;\n  C-->D;')"

            class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" viewBox="0 0 16 16" class="drop-shadow-sm"><path fill="currentColor" fill-rule="evenodd" d="M11.5 12.5A1.5 1.5 0 0 1 10 14H6a1.5 1.5 0 0 1-1.5-1.5v-.823a3.11 3.11 0 0 0-1.35-2.566A6.11 6.11 0 0 1 .5 4.073V3A1.5 1.5 0 0 1 2 1.5h.666A6.43 6.43 0 0 1 8 4.343A6.43 6.43 0 0 1 13.334 1.5H14A1.5 1.5 0 0 1 15.5 3v1.073a6.11 6.11 0 0 1-2.65 5.038a3.11 3.11 0 0 0-1.35 2.566zm-8-9.43a4.92 4.92 0 0 1 3.738 3.025c.275.688 1.249.688 1.524 0A4.92 4.92 0 0 1 13.334 3H14v1.073q0 .215-.02.427A4.61 4.61 0 0 1 12 7.875c-1.252.86-2 2.283-2 3.802v.823H6v-.823c0-1.52-.748-2.941-2-3.802a4.61 4.61 0 0 1-2-3.802V3h.666q.425 0 .834.07" clip-rule="evenodd"/></svg><span class="drop-shadow-sm">Mermaid</span>
            </div>

            <div @click="editor.commands.setPlantuml('@startuml\nBob -> Alice : hello\n@enduml')"

            class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] py-[5px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" viewBox="0 0 16 16" class="drop-shadow-sm"><path fill="currentColor" fill-rule="evenodd" d="M5.731 4H4.5A1.5 1.5 0 0 0 3 5.5v.377a2.72 2.72 0 0 1 0 5.246v.377A1.5 1.5 0 0 0 4.5 13h.377a2.72 2.72 0 0 1 5.246 0h.377a1.5 1.5 0 0 0 1.5-1.5v-1.232l1-.353a1.501 1.501 0 0 0 0-2.83l-1-.354V5.5A1.5 1.5 0 0 0 10.5 4H9.269l-.354-1a1.501 1.501 0 0 0-2.83 0zM8.9 14.5l-.204-1.02a1.22 1.22 0 0 0-2.392 0L6.1 14.5H4.5a3 3 0 0 1-3-3V9.9l1.02-.204a1.22 1.22 0 0 0 0-2.392L1.5 7.1V5.5a3 3 0 0 1 3-3h.17a3.001 3.001 0 0 1 5.66 0h.17a3 3 0 0 1 3 3v.17a3.001 3.001 0 0 1 0 5.66v.17a3 3 0 0 1-3 3z" clip-rule="evenodd"/></svg><span class="drop-shadow-sm">Plant UML</span>
            </div>

          </div>

          <!-- Row Manipulation -->

          <div class="flex space-x-2" v-if="editor.can().deleteTable()">

            <div
              class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[7px] py-[4px] max-h-fit rounded-2xl justify-center items-center cursor-pointer flex drop-shadow-cool space-x-1">

              <button @click="editor.chain().focus().deleteRow().run()" :disabled="!editor.can().deleteRow()">

                <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24"
                  class="text-red-600 dark:text-red-500">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M5 12h14" />
                </svg>

              </button>

              <span class="inline">Row</span>

              <button @click="editor.chain().focus().addRowAfter().run()" :disabled="!editor.can().addRowAfter()"
                class="text-black dark:text-gray-50">

                <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M5 12h14m-7-7v14" />
                </svg>

              </button>

            </div>

            <!-- Column Manipulation -->

            <div class="flex space-x-2" v-if="editor.can().deleteTable()">

              <div
                class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[7px] py-[4px] rounded-2xl justify-center items-center cursor-pointer flex  max-h-fit drop-shadow-cool space-x-1">

                <button @click="editor.chain().focus().deleteColumn().run()" :disabled="!editor.can().deleteColumn()">

                  <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24"
                    class="text-red-600 dark:text-red-500">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M5 12h14" />
                  </svg>

                </button>

                <span class="inline">Column</span>


                <button @click="editor.chain().focus().addColumnAfter().run()"
                  :disabled="!editor.can().addColumnAfter()" class="text-black dark:text-gray-50">

                  <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M5 12h14m-7-7v14" />
                  </svg>

                </button>

              </div>
            </div>

            <div @click="editor.chain().focus().toggleHeaderCell().run()" :disabled="!editor.can().toggleHeaderCell()"
              class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] !py-[4px] rounded-2xl justify-center items-center cursor-pointer drop-shadow-cool space-x-1 sm:flex hidden max-h-fit">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24"
                class="drop-shadow-sm text-black dark:text-gray-50">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M3.891 3.891C5.282 2.5 7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12c0-4.478 0-6.718 1.391-8.109"
                  color="currentColor" />
              </svg>
              <span>Header Cell</span>
            </div>

            <div @click="editor.chain().focus().deleteTable().run()"
              class="text-base dark:bg-[#cc1212] dark:hover:bg-[#b81010] bg-[#e01212] hover:bg-[#cc1212] border-[#bb1212] dark:border-[#b91616] border backdrop-blur-xl text-white sm:!px-[10px] sm:py-[4px] p-1.5 rounded-2xl justify-center max-h-fit items-center cursor-pointer flex drop-shadow-cool space-x-1.5">

              <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="m19.5 5.5l-.62 10.025c-.158 2.561-.237 3.842-.88 4.763a4 4 0 0 1-1.2 1.128c-.957.584-2.24.584-4.806.584c-2.57 0-3.855 0-4.814-.585a4 4 0 0 1-1.2-1.13c-.642-.922-.72-2.205-.874-4.77L4.5 5.5M3 5.5h18m-4.944 0l-.683-1.408c-.453-.936-.68-1.403-1.071-1.695a2 2 0 0 0-.275-.172C13.594 2 13.074 2 12.035 2c-1.066 0-1.599 0-2.04.234a2 2 0 0 0-.278.18c-.395.303-.616.788-1.058 1.757L8.053 5.5"
                  color="currentColor" />
              </svg>

              <span class="sm:block hidden">Delete</span>
            </div>

          </div>

        </div>
        <div class="sm:hidden md:flex items-center space-x-2 hidden fixed bottom-0 py-3 right-14">

          <div
            class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 bg-white backdrop-blur-xl text-black !px-[10px] py-[4px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool max-h-fit">
            {{ characterCount }} characters</div>
          <div
            class="border dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 border-gray-200 max-h-fit bg-white backdrop-blur-xl text-black !px-[10px] py-[4px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool">
            {{ wordCount }} words</div>
        </div>
      </div>

      <button
        class="fixed bottom-3 mx-2 right-0 border border-gray-200 bg-white dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 backdrop-blur-xl text-black !px-[8px] py-[7px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool"
        title="Focus Mode" @click="focus"><svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v14M5.98 3.285c3.342.637 5.333 1.967 6.02 2.731c.687-.764 2.678-2.094 6.02-2.73c1.692-.323 2.538-.484 3.26.134c.72.617.72 1.62.72 3.626v7.209c0 1.834 0 2.751-.463 3.324c-.462.572-1.48.766-3.518 1.154c-1.815.346-3.232.896-4.258 1.45c-1.01.545-1.514.817-1.761.817s-.752-.272-1.76-.817c-1.027-.553-2.444-1.104-4.26-1.45c-2.036-.388-3.055-.582-3.517-1.154C2 17.006 2 16.089 2 14.255V7.046c0-2.006 0-3.009.72-3.626c.722-.618 1.568-.457 3.26-.135" color="currentColor"/></svg></button>

      <button
        class="fixed bottom-3 border border-gray-200 bg-white backdrop-blur-xl dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50 text-black !px-[8px] py-[7px] rounded-2xl justify-center items-center space-x-1 cursor-pointer flex drop-shadow-cool right-[60px]"
        title="Print" v-if="focusMode" @click="printPDF"><svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24"><!-- Icon from Huge Icons by Hugeicons - undefined --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="currentColor"><path d="M3.5 10c0-3.771 0-5.657 1.245-6.828S7.993 2 12 2h.773c3.26 0 4.892 0 6.024.798c.324.228.612.5.855.805c.848 1.066.848 2.6.848 5.67v2.545c0 2.963 0 4.445-.469 5.628c-.754 1.903-2.348 3.403-4.37 4.113c-1.257.441-2.83.441-5.98.441c-1.798 0-2.698 0-3.416-.252c-1.155-.406-2.066-1.263-2.497-2.35c-.268-.676-.268-1.523-.268-3.216z"/><path d="M20.5 12a3.333 3.333 0 0 1-3.333 3.333c-.666 0-1.451-.116-2.098.057a1.67 1.67 0 0 0-1.179 1.179c-.173.647-.057 1.432-.057 2.098A3.333 3.333 0 0 1 10.5 22M8 7h7m-7 4h3"/></g></svg></button>

    </div>

    <UiInfo :open="open" :close="close"/>

  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount, computed, effect } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import color, { Color } from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Typography, { ellipsis } from "@tiptap/extension-typography";
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

import Underline from '@tiptap/extension-underline'

import { SmilieReplacer } from '../extensions/SmilieReplacer.ts'

// Import SVG icon components
import CaseSensitiveIcon from './icons/CaseSensitiveIcon.vue'
import ArrowLeftIcon from './icons/ArrowLeftIcon.vue'
import ArrowRightIcon from './icons/ArrowRightIcon.vue'
import ReplaceIcon from './icons/ReplaceIcon.vue'
import ReplaceAllIcon from './icons/ReplaceAllIcon.vue'
import MenuIcon from './icons/MenuIcon.vue'
import ExportIcon from './icons/ExportIcon.vue'
import ImportIcon from './icons/ImportIcon.vue'
import LightModeIcon from './icons/LightModeIcon.vue'
import DarkModeIcon from './icons/DarkModeIcon.vue'
import StylingIcon from './icons/StylingIcon.vue'
import AboutIcon from './icons/AboutIcon.vue'
import FocusModeIcon from './icons/FocusModeIcon.vue'
import PrintIcon from './icons/PrintIcon.vue'
import TableIcon from './icons/TableIcon.vue'
import MermaidIcon from './icons/MermaidIcon.vue'
import PlantUmlIcon from './icons/PlantUmlIcon.vue'
import MinusIcon from './icons/MinusIcon.vue'
import PlusIcon from './icons/PlusIcon.vue'
import HeaderCellIcon from './icons/HeaderCellIcon.vue'
import DeleteIcon from './icons/DeleteIcon.vue'

// load all languages with "all" or common languages with "common"
import { all, createLowlight } from 'lowlight'

import { UseDraggable } from '@vueuse/components'

import {
  Hyperlink,
} from "../extensions/hyperlink";

import {
  previewHyperlinkModal,
} from "../extensions/modals/previewHyperlink";

import {
  setHyperlinkModal,
} from "../extensions/modals/setHyperlink";
import { Mermaid } from '~/extensions/nodes/mermaid.ts';
import { MathBlock } from '~/extensions/nodes/math.ts';
import { Plantuml } from '~/extensions/nodes/plantuml.ts';
import { Embed } from '~/extensions/nodes/embed.ts';
import { Menu } from '@headlessui/vue'
import link from '@tiptap/extension-link'
import placeholder from '@tiptap/extension-placeholder'
import table from '@tiptap/extension-table'
import underline from '@tiptap/extension-underline'
import { useColorMode, set } from '@vueuse/core'
import { apply, data } from 'autoprefixer'
import { text, regexp } from 'linkifyjs'
import { Input, rule, comment, list } from 'postcss'
import { space } from 'postcss/lib/list'
import tippy from 'tippy.js'

var open = ref(false);

function close() {
  open.value = false
}

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
        class: 'dark:text-white/90 p-6 leading-loose py-2 text-[19px] min-h-[150px] w-full h-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 !opacity-100 geist',
      },
    },
    extensions: [
      Mermaid,
      MathBlock,
      Plantuml,
      Embed,
      CustomTaskItem,
      Underline,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle,
      Table.configure({ resizable: true }),
      Superscript,
      SubScript,
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
        autolink: false,
        openOnClick: false
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
      Hyperlink.configure({
      hyperlinkOnPaste: true,
      openOnClick: true,
      modals: {
        previewHyperlink: previewHyperlinkModal,
        setHyperlink: setHyperlinkModal,
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

  .tippy-box {
    .hyperlink-preview-modal,
    .hyperlink-set-modal,
    .hyperlink-edit-modal {
      filter: drop-shadow(0px 2px 5px rgba(0, 0, 0, 0.04));
      @apply flex overflow-hidden dark:!bg-[#404040] dark:border-[#525252] dark:text-gray-50  bg-white/85 backdrop-blur-xl border border-gray-200 rounded-[20px] text-black dark:!text-white/85 px-1.5 pl-2.5
    }

    .hyperlink-preview-modal__metadata,
    .hyperlink-set-modal__metadata,
    .hyperlink-edit-modal__metadata {
      width: 140px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-direction: row-reverse;
    }

    .hyperlink-preview-modal__metadata a,
    .hyperlink-set-modal__metadata a,
    .hyperlink-edit-modal__metadata a {
      font-size: 0.9rem;
      margin-right: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hyperlink-preview-modal__metadata img,
    .hyperlink-set-modal__metadata img,
    .hyperlink-edit-modal__metadata img {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .hyperlink-preview-modal__remove-button,
    .hyperlink-set-modal__remove-button,
    .hyperlink-edit-modal__remove-button,
    .hyperlink-preview-modal__edit-button,
    .hyperlink-set-modal__edit-button,
    .hyperlink-edit-modal__edit-button,
    .hyperlink-preview-modal__copy-button,
    .hyperlink-set-modal__copy-button,
    .hyperlink-edit-modal__copy-button,
    .hyperlink-preview-modal__apply-button,
    .hyperlink-set-modal__apply-button {
      width: 30px;
      height: 30px;
      border-radius: 40%;
      margin: 0 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.1s ease-in-out;
    }

    .hyperlink-edit-modal__apply-button{
      @apply  border !rounded-xl hover:!bg-gray-50
    }

    .hyperlink-preview-modal__remove-button:hover,
    .hyperlink-set-modal__remove-button:hover,
    .hyperlink-edit-modal__remove-button:hover,
    .hyperlink-preview-modal__edit-button:hover,
    .hyperlink-set-modal__edit-button:hover,
    .hyperlink-edit-modal__edit-button:hover,
    .hyperlink-preview-modal__copy-button:hover,
    .hyperlink-set-modal__copy-button:hover,
    .hyperlink-edit-modal__copy-button:hover,
    .hyperlink-preview-modal__apply-button:hover,
    .hyperlink-set-modal__apply-button:hover,
    .hyperlink-edit-modal__apply-button:hover {
      @apply bg-gray-100 dark:bg-[#171717]
    }

    .hyperlink-preview-modal__remove-button > svg,
    .hyperlink-set-modal__remove-button > svg,
    .hyperlink-edit-modal__remove-button > svg,
    .hyperlink-preview-modal__edit-button > svg,
    .hyperlink-set-modal__edit-button > svg,
    .hyperlink-edit-modal__edit-button > svg,
    .hyperlink-preview-modal__copy-button > svg,
    .hyperlink-set-modal__copy-button > svg,
    .hyperlink-edit-modal__copy-button > svg,
    .hyperlink-preview-modal__apply-button > svg,
    .hyperlink-set-modal__apply-button > svg,
    .hyperlink-edit-modal__apply-button > svg {
      width: 19px;
      height: 19px;
    }

    .hyperlink-preview-modal form,
    .hyperlink-set-modal form,
    .hyperlink-edit-modal form {
      display: flex;
      align-items: flex-end;
      width: 100%;
    }

    .hyperlink-preview-modal form input,
    .hyperlink-set-modal form input,
    .hyperlink-edit-modal form input {
      border: 1px solid #dadce0;
      border-radius: 10px;
      padding: 0.8rem 0.8rem;
      margin-bottom: 0.2rem;
      width: 100%;
      @apply drop-shadow-sm
    }

    .hyperlink-preview-modal {
      padding: 8px;
    }

    .hyperlink-preview-modal form input:last-of-type,
    .hyperlink-set-modal form input:last-of-type,
    .hyperlink-edit-modal form input:last-of-type {
      margin-bottom: 0;
    }

    .hyperlink-edit-modal__inputs-wrapper > input {
      @apply bg-white !py-2 dark:bg-[#171717] !rounded-2xl !inline
    }



    .hyperlink-set-modal__buttons-wrapper,
    .hyperlink-edit-modal__buttons-wrapper {
      margin-left: 8px;
    }

    .hyperlink-set-modal__buttons-wrapper button,
    .hyperlink-edit-modal__buttons-wrapper button {
      border-radius: 6px;
      padding: 4px 14px;
      width: 70px;
      margin-bottom: 0.2rem;
    }

    .tippy-svg-arrow {
      top: -6px !important;
    }
  }

/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  pre {
    border-radius: 1.1rem;
    font-family: 'Roboto Mono', monospace;
    margin: 1.5rem 0;
    padding: 0.6rem 1rem;
    @apply bg-[#fafcfb] dark:text-white/50 border dark:border-white/10 border-gray-200 dark:bg-[#1e1e1e] inline-block px-8 pl-5;

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
      @apply text-[#b5b5b5] dark:text-white/40;
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
      @apply bg-gray-50 dark:bg-[#303030];
    }

    /* Selected cell styling */
    .selectedCell:after {
      content: "";
      @apply absolute top-0 left-0 right-0 bottom-0 z-10 pointer-events-none;

      /* Light and dark mode for selected cell */
      @apply bg-gray-100/30 dark:bg-[#292828];
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
  @apply bg-[#fff476] dark:bg-[#eeea7f55] dark:text-white;
  border-radius: 0.6rem;
  padding: 0.1rem 0.3rem;
}

code {
  font-family: 'Roboto Mono';
  font-size: 18px;
  border-radius: 0.6rem;
  padding: 0.1rem 0.3rem;

  @apply bg-gray-100/40 dark:bg-white/10 text-purple-600 dark:text-red-300
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

a {
  @apply text-blue-700 underline dark:text-blue-200
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