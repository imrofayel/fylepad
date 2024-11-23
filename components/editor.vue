<template>

  <UseDraggable class="absolute flex w-full items-center justify-center" style="user-select: none">
    <div class="w-full flex justify-center cursor-move z-[40] items-center">
      <div class="m-8 top-0 p-4 rounded-xl border justify-center items-center fixed border-gray-100 dark:border-none dark:bg-[#2d3d33] bg-gray-50 z-[100] flex flex-col space-y-6" v-if="showSearch">

        <section class="flex gap-2">
          <div class="absolute -right-[4px] -top-2 z-10 bg-red-500 hover:bg-red-600 w-6 h-6 flex items-center justify-center text-lg text-white rounded-full cursor-pointer" @click="toggleSearch">&times;</div>
          <div>
            <div class="mt-1 p-2 bg-white/80 border dark:border-none border-gray-100 backdrop-blur-xl rounded-xl dark:bg-[#171f18] text-black/75 dark:text-white/90 flex justify-center">
              <Input v-model="searchTerm" @keydown.enter.prevent="updateSearchReplace" type="text" placeholder="Search" autofocus="true" class="placeholder:text-gray-200 dark:placeholder:text-gray-200/80 bg-transparent outline-none" />
              <button title="Case Sensitive" @click="toggleCase" class="px-1.5" :class="caseSensitive ? 'opacity-90 dark:opacity-100' : 'opacity-20 dark:opacity-50'">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                    <path d="m3 15l4-8l4 8m-7-2h6" />
                    <circle cx="18" cy="12" r="3" />
                    <path d="M21 9v6" />
                  </g>
                </svg>
              </button>
            </div>
          </div>

          <div>
            <div class="mt-1">
              <input v-model="replaceTerm" @keydown.enter.prevent="replace" type="text" placeholder="Replace" class="placeholder:text-gray-200 dark:placeholder:text-gray-200/80 outline-none p-2 bg-white/80 border dark:border-none border-gray-100 backdrop-blur-xl rounded-xl dark:bg-[#171f18] text-black/75 dark:text-white/90" />
            </div>
          </div>

        </section>

        <span class="inline-flex rounded-md isolate">
          <button @click="previous" type="button" class="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium bg-white border dark:border-none dark:bg-[#171f18] dark:text-white/90 border-gray-100 hover:bg-gray-50 rounded-l-xl hover:dark:bg-[#212d23]">
            Previous
          </button>
          <button @click="next" type="button" class="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium bg-white border border-gray-100 hover:bg-gray-50 dark:border-none dark:bg-[#171f18] dark:text-white/90 hover:dark:bg-[#212d23]">
            Next
          </button>
          <button @click="replace" type="button" class="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium bg-white border border-gray-100 hover:bg-gray-50 dark:border-none dark:bg-[#171f18] dark:text-white/90 hover:dark:bg-[#212d23]">
            Replace
          </button>
          <button @click="replaceAll" type="button" class="relative inline-flex items-center px-4 py-2 -ml-px text-sm font-medium bg-white border border-gray-100 hover:bg-gray-50 rounded-r-xl dark:border-none dark:bg-[#171f18] hover:dark:bg-[#212d23] dark:text-white/90">
            Replace All
          </button>
          <div class="block font-medium text-gray-700 dark:text-white/90 py-2 px-4">
            Results: {{ editor?.storage?.searchAndReplace?.resultIndex + 1 }} / {{editor?.storage?.searchAndReplace?.results.length }}
          </div>
        </span>
      </div>
    </div>
  </UseDraggable>

  <div class="h-full flex flex-col tiptap">

    <div class="flex space-x-1 fixed right-0 top-1 z-[12] p-3 py-2" :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">

      <button title="Search" class=" text-onPrimaryContainer  hover:bg-primaryContainer/60 backdrop-blur-xl px-3 p-3 rounded-[6px] justify-center items-center cursor-pointer" @click="toggleSearch">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.75a7.25 7.25 0 0 1 5.63 11.819l4.9 4.9a.75.75 0 0 1-.976 1.134l-.084-.073-4.901-4.9A7.25 7.25 0 1 1 10 2.75Zm0 1.5a5.75 5.75 0 1 0 0 11.5 5.75 5.75 0 0 0 0-11.5Z" fill="#000000"/></svg>
      </button>


      <button title="Save (Cntrl+S)" @click="exportMarkdown" :class="[' text-onPrimaryContainer  hover:bg-primaryContainer/60 backdrop-blur-xl flex px-3 p-3 rounded-[6px] justify-center items-center cursor-pointer']">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 5.75A2.75 2.75 0 0 1 5.75 3h9.964a3.25 3.25 0 0 1 2.299.952l2.035 2.035c.61.61.952 1.437.952 2.299v9.964A2.75 2.75 0 0 1 18.25 21H5.75A2.75 2.75 0 0 1 3 18.25V5.75ZM5.75 4.5c-.69 0-1.25.56-1.25 1.25v12.5c0 .69.56 1.25 1.25 1.25H6v-5.25A2.25 2.25 0 0 1 8.25 12h7.5A2.25 2.25 0 0 1 18 14.25v5.25h.25c.69 0 1.25-.56 1.25-1.25V8.286c0-.465-.184-.91-.513-1.238l-2.035-2.035a1.75 1.75 0 0 0-.952-.49V7.25a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 7 7.25V4.5H5.75Zm10.75 15v-5.25a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0-.75.75v5.25h9Zm-8-15v2.75c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75V4.5h-6Z" fill="#000000"/></svg>
      </button>

      <button  title="Import" @click="importMarkdownOrText" :class="[' text-onPrimaryContainer  hover:bg-primaryContainer/60 backdrop-blur-xl flex px-3 p-3 rounded-[6px] justify-center items-center cursor-pointer']">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 20a.5.5 0 0 1-.5.5h-5.732A6.518 6.518 0 0 1 11.19 22H18a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414l-5.829-5.828a.491.491 0 0 0-.049-.04.63.63 0 0 1-.036-.03 2.072 2.072 0 0 0-.219-.18.652.652 0 0 0-.08-.044l-.048-.024-.05-.029c-.054-.031-.109-.063-.166-.087a1.977 1.977 0 0 0-.624-.138c-.02-.001-.04-.004-.059-.007A.605.605 0 0 0 12.172 2H6a2 2 0 0 0-2 2v7.498a6.451 6.451 0 0 1 1.5-.422V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5v10Zm-5-15.379L17.378 8.5H14a.5.5 0 0 1-.5-.5V4.621Z" fill="#000000"/><path d="M12 17.5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0ZM7 18l.001 2.503a.5.5 0 1 1-1 0V18H3.496a.5.5 0 0 1 0-1H6v-2.5a.5.5 0 1 1 1 0V17h2.497a.5.5 0 0 1 0 1H7Z" fill="#000000"/></svg>
      </button>

      <button title="Light" @click="onClick('light')" v-if="colorMode.value == 'dark'" :class="[' text-onPrimaryContainer  hover:bg-primaryContainer/60 backdrop-blur-xl flex px-3 p-3 rounded-[6px] justify-center items-center cursor-pointer']">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
          </g>
        </svg>
      </button>

      <button title="Dark" @click="onClick('dark')" v-if="colorMode.value == 'light'" :class="[' text-onPrimaryContainer  hover:bg-primaryContainer/60 backdrop-blur-xl flex px-3 p-3 rounded-[6px] justify-center items-center cursor-pointer']">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9" />
        </svg>
      </button>


      <button title="Edit Text" @click="isBottomSheetOpen = true" :class="[' text-onPrimaryContainer  hover:bg-primaryContainer/60 backdrop-blur-xl flex px-3 p-3 rounded-[6px] justify-center items-center cursor-pointer']">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.063 8.445a3.218 3.218 0 0 1-.002 4.551l-7.123 7.112a2.251 2.251 0 0 1-.943.562L7.702 21.96a1 1 0 0 1-1.24-1.264l1.362-4.228c.11-.34.3-.65.552-.903l7.133-7.121a3.22 3.22 0 0 1 4.554.002Zm-3.494 1.06-7.133 7.12a.75.75 0 0 0-.184.301l-1.07 3.323 3.382-1.015a.749.749 0 0 0 .314-.188L19 11.936a1.718 1.718 0 1 0-2.431-2.432ZM8.15 2.37l.05.105 3.253 8.249-1.157 1.155L9.556 10H5.443l-.995 2.52a.75.75 0 0 1-.876.454l-.098-.031a.75.75 0 0 1-.452-.876l.03-.098 3.754-9.495c.236-.595 1.043-.63 1.345-.104Zm-.648 2.422L6.036 8.5h2.928L7.503 4.792Z" fill="#000000"/></svg>
      </button>

      <UiBottomSheet :isOpen="isBottomSheetOpen" @close="isBottomSheetOpen = false" :editor="editor as any" />
      
    </div>

    <div class="flex fixed justify-between w-full p-2 py-0 pt-4 bg-surface backdrop-blur-xl z-10" v-show="!focusMode">

      <div class="flex w-full justify-between items-center space-x-2">
        
        <input v-model="localTitle" @input="$emit('update:title', localTitle)" placeholder="Untitled" class="w-full font-semibold text-gray-800 border border-none ring-0 focus:border-none px-3 dark:text-white text-black/90 outline-none bg-transparent rounded flex text-[26px]" />
        
        <button @click="printPDF" class="bg-gray-50 space-x-1 hover:bg-white hover:bg-white/80 dark:bg-[#2d3d33] dark:text-white/90 hover:dark:bg-[#1f2920] dark:border-transparent border-gray-100 border backdrop-blur-xl flex px-3 p-1 rounded-2xl justify-center items-center text-black/75 cursor-pointer" :class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">

          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.752 3a2.25 2.25 0 0 1 2.25 2.25v.753h.75a3.254 3.254 0 0 1 3.252 3.25l.003 5.997a2.249 2.249 0 0 1-2.248 2.25H18v1.25A2.25 2.25 0 0 1 15.75 21h-7.5A2.25 2.25 0 0 1 6 18.75V17.5H4.25A2.25 2.25 0 0 1 2 15.25V9.254a3.25 3.25 0 0 1 3.25-3.25l.749-.001L6 5.25A2.25 2.25 0 0 1 8.25 3h7.502Zm-.002 10.5h-7.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75Zm3.002-5.996H5.25a1.75 1.75 0 0 0-1.75 1.75v5.996c0 .414.336.75.75.75H6v-1.75A2.25 2.25 0 0 1 8.25 12h7.5A2.25 2.25 0 0 1 18 14.25V16h1.783a.749.749 0 0 0 .724-.749l-.003-5.997a1.754 1.754 0 0 0-1.752-1.75Zm-3-3.004H8.25a.75.75 0 0 0-.75.75l-.001.753h9.003V5.25a.75.75 0 0 0-.75-.75Z" fill="#808080"/></svg>
          <span> Print </span>
        </button>

      </div>
    </div>

    <div class="flex-grow mt-12">
      <floating-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div class="flex overflow-hidden bg-white/60 dark:bg-[#2d3d33] dark:border-none backdrop-blur-xl rounded-xl border text-black/70 dark:text-white/85 relative left-[5rem]">
          <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('heading', { level: 1 }) }" class="rounded-l-lg hover:bg-gray-100 hover:dark:bg-[#1f2920] p-2 px-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 5.081a.746.746 0 0 0-.809.084.751.751 0 0 0-.249.367c-.69 2.051-2.057 3.409-3.168 4.075a.75.75 0 0 0 .772 1.286c.774-.464 1.623-1.18 2.364-2.146v9.503a.75.75 0 0 0 1.5 0V5.772a.75.75 0 0 0-.41-.69ZM3.5 5.75a.75.75 0 0 0-1.5 0v12.5a.75.75 0 0 0 1.5 0V12.5H10v5.75a.75.75 0 0 0 1.5 0V5.75a.75.75 0 0 0-1.5 0V11H3.5V5.75Z" fill="#363636"/></svg>
          </button>

          <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('bulletList') }"class="hover:bg-gray-100 p-2 px-2 hover:dark:bg-[#1f2920]">

            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.25 17.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm3.5.5h14.5a.75.75 0 0 1 .102 1.494l-.102.006H6.75a.75.75 0 0 1-.102-1.493L6.75 18h14.5-14.5Zm-3.5-7a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm3.5.5h14.5a.75.75 0 0 1 .102 1.494L21.25 13H6.75a.75.75 0 0 1-.102-1.493l.102-.007h14.5-14.5Zm-3.5-7A1.25 1.25 0 1 1 3.25 7a1.25 1.25 0 0 1 0-2.499Zm3.5.5h14.5a.75.75 0 0 1 .102 1.494l-.102.006H6.75a.75.75 0 0 1-.102-1.493L6.75 5h14.5-14.5Z" fill="#363636"/></svg>

          </button>

          <button @click="editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('orderedList') }"
            class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">

            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 2.75a.75.75 0 0 0-1.434-.307l-.002.003a1.45 1.45 0 0 1-.067.132 4.126 4.126 0 0 1-.238.384c-.217.313-.524.663-.906.902a.75.75 0 1 0 .794 1.272c.125-.078.243-.161.353-.248V7.25a.75.75 0 0 0 1.5 0v-4.5ZM20.5 18.75a.75.75 0 0 0-.75-.75h-9a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 .75-.75ZM20.5 12.244a.75.75 0 0 0-.75-.75h-9a.75.75 0 1 0 0 1.5h9a.75.75 0 0 0 .75-.75ZM20.5 5.75a.75.75 0 0 0-.75-.75h-9a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 .75-.75ZM5.15 10.52c-.3-.053-.676.066-.87.26a.75.75 0 1 1-1.06-1.06c.556-.556 1.43-.812 2.192-.677.397.07.805.254 1.115.605.316.358.473.825.473 1.352 0 .62-.271 1.08-.606 1.42-.278.283-.63.511-.906.689l-.08.051a5.88 5.88 0 0 0-.481.34H6.25a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75c0-1.314.984-1.953 1.575-2.337l.06-.04c.318-.205.533-.345.69-.504.134-.136.175-.238.175-.369 0-.223-.061-.318-.098-.36a.42.42 0 0 0-.251-.12ZM2.97 21.28s.093.084.004.005l.006.005.013.013a1.426 1.426 0 0 0 .15.125c.095.07.227.158.397.243.341.17.83.329 1.46.329.64 0 1.196-.181 1.601-.54.408-.36.61-.857.595-1.359A1.775 1.775 0 0 0 6.77 19c.259-.305.412-.685.426-1.101a1.73 1.73 0 0 0-.595-1.36C6.196 16.181 5.64 16 5 16c-.63 0-1.119.158-1.46.33a2.592 2.592 0 0 0-.51.334 1.426 1.426 0 0 0-.037.033l-.013.013-.006.005-.002.003H2.97l-.001.002a.75.75 0 0 0 1.048 1.072 1.1 1.1 0 0 1 .192-.121c.159-.08.42-.171.79-.171.36 0 .536.1.608.164.07.061.09.127.088.187a.325.325 0 0 1-.123.23c-.089.077-.263.169-.573.169a.75.75 0 0 0 0 1.5c.31 0 .484.092.573.168.091.08.121.166.123.231a.232.232 0 0 1-.088.187c-.072.064-.247.164-.608.164a1.75 1.75 0 0 1-.79-.17 1.1 1.1 0 0 1-.192-.122.75.75 0 0 0-1.048 1.072Zm.002-4.563-.001.002c.007-.006.2-.168 0-.002Z" fill="#363636"/></svg>

          </button>

          <button @click="editor.chain().focus().toggleTaskList().run()"
            :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('taskList', { level: 1 }) }"
            class="hover:bg-gray-100 hover:dark:bg-[#1f2920] p-2 px-2">

          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.248 16.002c.966 0 1.75.784 1.75 1.75v2.498A1.75 1.75 0 0 1 6.248 22H3.75A1.75 1.75 0 0 1 2 20.25v-2.498c0-.966.784-1.75 1.75-1.75h2.498Zm0 1.5H3.75a.25.25 0 0 0-.25.25v2.498c0 .138.112.25.25.25h2.498a.25.25 0 0 0 .25-.25v-2.498a.25.25 0 0 0-.25-.25Zm3.5.498h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493L9.748 18h11.505H9.748Zm-3.5-8.999c.966 0 1.75.784 1.75 1.75v2.498a1.75 1.75 0 0 1-1.75 1.75H3.75A1.75 1.75 0 0 1 2 13.249V10.75c0-.966.784-1.75 1.75-1.75h2.498Zm0 1.5H3.75a.25.25 0 0 0-.25.25v2.498c0 .138.112.25.25.25h2.498a.25.25 0 0 0 .25-.25V10.75a.25.25 0 0 0-.25-.25Zm3.5.499h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493L9.748 11h11.505H9.748Zm-3.5-9c.966 0 1.75.784 1.75 1.75v2.498a1.75 1.75 0 0 1-1.75 1.75H3.75A1.75 1.75 0 0 1 2 6.248V3.75C2 2.784 2.784 2 3.75 2h2.498Zm0 1.5H3.75a.25.25 0 0 0-.25.25v2.498c0 .138.112.25.25.25h2.498a.25.25 0 0 0 .25-.25V3.75a.25.25 0 0 0-.25-.25Zm3.5.5h11.505a.75.75 0 0 1 .102 1.493l-.102.007H9.748a.75.75 0 0 1-.102-1.493L9.748 4h11.505H9.748Z" fill="#363636"/></svg>

          </button>

          <button @click="editor.chain().focus().toggleCode().run()"
            :class="{ 'dark:bg-[#1f2920] bg-gray-100': editor.isActive('code') }"
            class="hover:bg-gray-100 p-2 px-2 hover:dark:bg-[#1f2920]">

            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m8.066 18.943 6.5-14.5a.75.75 0 0 1 1.404.518l-.036.096-6.5 14.5a.75.75 0 0 1-1.404-.518l.036-.096 6.5-14.5-6.5 14.5ZM2.22 11.47l4.25-4.25a.75.75 0 0 1 1.133.976l-.073.085L3.81 12l3.72 3.719a.75.75 0 0 1-.976 1.133l-.084-.073-4.25-4.25a.75.75 0 0 1-.073-.976l.073-.084 4.25-4.25-4.25 4.25Zm14.25-4.25a.75.75 0 0 1 .976-.073l.084.073 4.25 4.25a.75.75 0 0 1 .073.976l-.073.085-4.25 4.25a.75.75 0 0 1-1.133-.977l.073-.084L20.19 12l-3.72-3.72a.75.75 0 0 1 0-1.06Z" fill="#363636"/></svg>
          </button>
        </div>
      </floating-menu>

      <bubble-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div class="flex overflow-hidden dark:bg-[#2d3d33] dark:border-none bg-white/60 border backdrop-blur-xl rounded-xl text-black/70 dark:text-white/85">
          <button @click="editor.chain().focus().toggleBold().run()":class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('bold') }"class="rounded-l-lg hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.935 4.44A1.5 1.5 0 0 1 7.996 4h4.383C15.017 4 17 6.182 17 8.625a4.63 4.63 0 0 1-.865 2.682c1.077.827 1.866 2.12 1.866 3.813C18 18.232 15.3 20 13.12 20H8a1.5 1.5 0 0 1-1.5-1.5l-.004-13c0-.397.158-.779.44-1.06ZM9.5 10.25h2.88c.903 0 1.62-.76 1.62-1.625S13.281 7 12.38 7H9.498l.002 3.25Zm0 3V17h3.62c.874 0 1.88-.754 1.88-1.88 0-1.13-.974-1.87-1.88-1.87H9.5Z" fill="#545454"/></svg>
          </button>
          <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-200/50 dark:bg-[#1f2920]': editor.isActive('italic') }" class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.75 4h8.504a.75.75 0 0 1 .102 1.493l-.102.006h-3.197L10.037 18.5h4.213a.75.75 0 0 1 .742.648l.007.102a.75.75 0 0 1-.648.743L14.25 20h-9.5a.747.747 0 0 1-.746-.75c0-.38.28-.694.645-.743l.101-.007h3.685l.021-.065L13.45 5.499h-3.7a.75.75 0 0 1-.742-.648L9 4.75a.75.75 0 0 1 .648-.743L9.751 4h8.503-8.503Z" fill="#545454"/></svg>

          </button>
          <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('strike') }"class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.75 12h14.5a.75.75 0 0 1 .102 1.493l-.101.007h-2.975c.88.813 1.336 1.793 1.336 2.935 0 2.825-3.232 4.64-6.754 4.23-2.235-.26-3.809-1.155-4.635-2.702a.75.75 0 0 1 1.323-.707c.57 1.068 1.702 1.712 3.485 1.92 2.743.318 5.081-.995 5.081-2.741 0-1.172-.805-2.127-2.565-2.886l-.116-.049H4.75a.75.75 0 0 1-.743-.648L4 12.75a.75.75 0 0 1 .648-.743L4.75 12h14.5-14.5Zm1.511-3.877c.152-2.83 2.822-4.468 6.324-4.061 2.188.254 3.863 1.053 4.982 2.409a.75.75 0 1 1-1.157.955c-.852-1.033-2.17-1.662-3.999-1.874-2.717-.316-4.65.804-4.65 2.571 0 .772.234 1.348.83 1.982l.128.132c.094.096.197.195.25.24l.031.02H7.08l-.024-.038c-.143-.206-.856-1.195-.795-2.336Z" fill="#545454"/></svg>
          </button>
          <button @click="editor.chain().focus().toggleHighlight().run()" :class="{ 'bg-gray-100 dark:bg-[#1f2920]': editor.isActive('highlight') }" class="hover:dark:bg-[#1f2920] hover:bg-gray-100 p-2 px-2 rounded-r-lg">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.259 2.004a.75.75 0 0 1 .742.649l.007.102-.004 4.497a2.254 2.254 0 0 1-2.001 2.234v2.26a2.25 2.25 0 0 1-2.096 2.245l-.154.005H16.5v2.792a2.25 2.25 0 0 1-1.14 1.958l-.155.08-6.635 3.106a.75.75 0 0 1-1.061-.579l-.007-.1v-7.257H7.25A2.25 2.25 0 0 1 5.005 11.9L5 11.746v-2.26a2.25 2.25 0 0 1-1.994-2.072L3 7.25V2.754a.75.75 0 0 1 1.493-.102l.007.102V7.25c0 .38.282.694.648.744L5.25 8h13.501c.38 0 .695-.283.746-.649l.007-.101.004-4.497a.75.75 0 0 1 .75-.75ZM15 13.996H9.003v6.077l5.567-2.606a.75.75 0 0 0 .424-.572l.008-.107L15 13.996ZM17.502 9.5H6.5v2.246c0 .38.282.694.648.743l.102.007h9.503a.75.75 0 0 0 .743-.648l.007-.102-.001-2.246Z" fill="#545454"/></svg>
          </button>
        </div>
      </bubble-menu>

      <EditorContent :editor="editor as any" class="h-full overflow-auto mb-4 px-4" />

      <div class="bg-primaryContainer text-onPrimaryContainer p-1.5 px-3 border-gray-300 border-t flex justify-between items-center fixed bottom-0 w-full select-none" v-if="editor":class="focusMode ? 'opacity-0 duration-500 transition-all ease-in-out' : 'opacity-100 duration-500 transition-all ease-in-out'">
        <div class="flex space-x-4">

          <div class="flex space-x-4" v-if="!editor.can().deleteTable()">
            <div @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"class="space-x-1 text-onPrimaryContainer  hover:bg-primaryContainer/90 flex px-3 p-2 rounded-[6px] justify-center items-center cursor-pointer">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 6.25A3.25 3.25 0 0 1 6.25 3h11.5A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25ZM6.25 4.5A1.75 1.75 0 0 0 4.5 6.25v5h6.75V4.5h-5Zm5 8.25H4.5v5c0 .966.784 1.75 1.75 1.75h5v-6.75Zm1.5 0v6.75h5a1.75 1.75 0 0 0 1.75-1.75v-5h-6.75Zm6.75-1.5v-5a1.75 1.75 0 0 0-1.75-1.75h-5v6.75h6.75Z" fill="#000000"/></svg>
              <span>Table</span>
            </div>
          </div>

          <div class="flex space-x-2" v-if="editor.can().deleteTable()">

            <!-- Row Manipulation -->
            <div class="bg-[#ffffff] text-base dark:bg-[#1f2920] dark:border-transparent backdrop-blur-xl flex px-3 p-1 rounded-[6px] justify-center items-center dark:text-white/90 text-black/80  space-x-2 border border-gray-200">
              <button class="hover:bg-primaryContainer/40 p-[3px] rounded-[6px]" @click="editor.chain().focus().deleteRow().run()" :disabled="!editor.can().deleteRow()">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24" class="text-red-600">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M5 12h14" />
                </svg>
              </button>

              <span class="inline">Row</span>

              <button class="hover:bg-primaryContainer/40 p-[3px] rounded-[6px]" @click="editor.chain().focus().addRowAfter().run()" :disabled="!editor.can().addRowAfter()">

                <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                    stroke-width="2" d="M5 12h14m-7-7v14" />
                </svg>

              </button>

            </div>

            <!-- Column Manipulation -->

            <div class="flex space-x-2" v-if="editor.can().deleteTable()">

              <div class="bg-[#ffffff] text-base dark:bg-[#1f2920] dark:border-transparent backdrop-blur-xl flex px-3 p-1 rounded-[6px] justify-center items-center border-gray-200 border dark:text-white/90 text-black/80 space-x-2">

                <button class="hover:bg-primaryContainer/40 p-[3px] rounded-[6px]" @click="editor.chain().focus().deleteColumn().run()" :disabled="!editor.can().deleteColumn()">

                  <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24" class="text-red-600">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M5 12h14" />
                  </svg>

                </button>

                <span class="inline">Column</span>


                <button class="hover:bg-primaryContainer/40 p-[3px] rounded-[6px]" @click="editor.chain().focus().addColumnAfter().run()":disabled="!editor.can().addColumnAfter()">

                  <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M5 12h14m-7-7v14" />
                  </svg>

                </button>

              </div>
            </div>

            <div  @click="editor.chain().focus().toggleHeaderCell().run()" :disabled="!editor.can().toggleHeaderCell()" class="bg-[#ffffff] text-base dark:bg-[#1f2920] dark:border-transparent hover:bg-primaryContainer backdrop-blur-xl flex px-3 p-1 rounded-[6px] justify-center items-center dark:text-white/90 border-gray-200 hover:border-gray-300 border text-black/80 cursor-pointer space-x-2">
              Header
            </div>

            <div @click="editor.chain().focus().deleteTable().run()" class="text-base dark:hover:bg-[#c10c0cd0] dark:bg-[#860d0dcd] dark:border-transparent backdrop-blur-xl flex px-3 p-1 rounded-[8px] justify-center items-center text-white cursor-pointer">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75Zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5ZM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75Zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75Zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25Z" fill="#E81123"/></svg>
            </div>

          </div>

        </div>
        <div class="sm:hidden md:flex items-center space-x-2 mr-4 hidden text-onPrimaryContainer relative right-11">
          <div class="text-gray-700 text-sm flex justify-center items-center">{{ characterCount }} characters</div>
          <div class="h-4 w-[1px] bg-gray-400"></div>
          <div class="text-gray-700 text-sm flex justify-center items-center">{{ wordCount }} words</div>
        </div>
      </div>

      <button class="fixed bottom-1.5 mx-2 right-0 text-onPrimaryContainer hover:bg-primaryContainer/90 flex px-3 p-2 rounded-[6px] justify-center items-center cursor-pointer" title="Focus Mode" @click="focus">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </button>

      <button class="fixed bottom-1.5 hover:bg-primaryContainer/90  px-3 p-2 rounded-[6px] text-black/80 dark:text-white/90 right-14" title="Print" v-if="focusMode" @click="printPDF">
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.752 3a2.25 2.25 0 0 1 2.25 2.25v.753h.75a3.254 3.254 0 0 1 3.252 3.25l.003 5.997a2.249 2.249 0 0 1-2.248 2.25H18v1.25A2.25 2.25 0 0 1 15.75 21h-7.5A2.25 2.25 0 0 1 6 18.75V17.5H4.25A2.25 2.25 0 0 1 2 15.25V9.254a3.25 3.25 0 0 1 3.25-3.25l.749-.001L6 5.25A2.25 2.25 0 0 1 8.25 3h7.502Zm-.002 10.5h-7.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75Zm3.002-5.996H5.25a1.75 1.75 0 0 0-1.75 1.75v5.996c0 .414.336.75.75.75H6v-1.75A2.25 2.25 0 0 1 8.25 12h7.5A2.25 2.25 0 0 1 18 14.25V16h1.783a.749.749 0 0 0 .724-.749l-.003-5.997a1.754 1.754 0 0 0-1.752-1.75Zm-3-3.004H8.25a.75.75 0 0 0-.75.75l-.001.753h9.003V5.25a.75.75 0 0 0-.75-.75Z" fill="#000000"/></svg>
      </button>

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
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
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

function openSheet() {
  isBottomSheetOpen.value = !isBottomSheetOpen.value
}

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
        class: 'dark:text-white/90 p-6 leading-loose py-2 text-black/80 text-[19px] min-h-[150px] w-full h-full overflow-auto border-none bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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

// const handleExportPDF = () => {
//   if (editor.value) {
//     const htmlContent = editor.value.getHTML();
//     md2pdf(htmlContent, localTitle.value);
//   } else {
//     console.error('Editor instance is not available.');
//   }
// };

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

// onMounted(() => setTimeout(updateSearchReplace));

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
    padding: 0.75rem 1rem;
    @apply bg-gray-50 dark:bg-[#2d3d33] inline-block px-8 pl-5;

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
    @apply border-collapse w-full table-fixed overflow-hidden m-0;

    td,
    th {
      @apply border box-border min-w-[1em] p-2 align-top relative;

      /* Adding transparent borders */
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
    @apply my-6 overflow-x-auto border-opacity-60;
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
  @apply bg-[#fcfada] text-amber-400 dark:bg-[#757142] dark:text-amber-100;
  border-radius: 0.4rem;
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
  border-radius: 8px;
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
  border: 2px solid #eaeaea;
  /* Border to match background */
  border-radius: 8px;
  /* Rounded corners */
  margin-right: 0.5rem;
  /* Space between checkbox and text */
  position: relative;
}

ul[data-type="taskList"] label>input[type="checkbox"]:checked {
  background-color: #00bcf0;
  border-color: #00bcf0;
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