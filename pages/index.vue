    <template>
      <div class="h-screen flex flex-col">
        <!-- Tab bar -->
        <div class="flex justify-between items-center w-full p-5 py-4 fixed bg-white/70 backdrop-blur-lg z-10">
          <div class="flex space-x-2 overflow-x-auto">
            <div v-for="(tab, index) in tabs" :key="index" @click="activeTab = index"
              class="bg-[#f6f6f640] border backdrop-blur-xl flex px-3 p-1 rounded-2xl justify-center items-center text-black/70 cursor-pointer"
              :class="{ 'bg-gray-50': activeTab === index }">
              {{ tab.title || 'Untitled' }}
              <button @click.stop="closeTab(index)" class="ml-2 text-black/50 hover:text-black/70">&times;</button>
            </div>

            <button @click="newTab"
              class="bg-[#f6f6f670] border backdrop-blur-lg flex px-2 p-1 rounded-2xl justify-center items-center text-black/60">
              <Icon name="lucide:plus" size="18"></Icon>
            </button>

          </div>
          <div class="flex space-x-3">
            <button @click="exportJson"
              class="bg-[#f6f6f670] border backdrop-blur-lg flex px-3 p-1 rounded-2xl justify-center items-center text-black/70">Save</button>
            <button @click="triggerFileInput"
              class="bg-[#f6f6f670] border backdrop-blur-lg flex px-3 p-1 rounded-2xl justify-center items-center text-black/70">Open</button>
            <input type="file" ref="fileInput" accept="application/json" @change="importJson" class="hidden" />
          </div>
        </div>

        <!-- Editor container -->
        <div class="mt-14 flex-grow">
          <Editor v-if="tabs.length > 0" :key="activeTab" :title="tabs[activeTab].title"
            :content="tabs[activeTab].content" @update:title="updateTabTitle" @update:content="updateTabContent" />
        </div>
      </div>
    </template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';

interface Tab {
  title: string;
  content: any;
}

const tabs = reactive<Tab[]>([{ title: 'Untitled', content: '' }]);
const activeTab = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

const newTab = () => {
  tabs.push({ title: 'Untitled', content: '' });
  activeTab.value = tabs.length - 1;
};

const closeTab = (index: number) => {
  if (tabs.length > 1) {
    tabs.splice(index, 1);
    if (activeTab.value >= index && activeTab.value > 0) {
      activeTab.value--;
    }
  }
};

const updateTabTitle = (newTitle: string) => {
  tabs[activeTab.value].title = newTitle;
};

const updateTabContent = (content: any) => {
  tabs[activeTab.value].content = content;
};

const exportJson = () => {
  const exportData = {
    title: tabs[activeTab.value].title,
    content: tabs[activeTab.value].content,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${exportData.title || 'untitled'}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const importJson = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (result) {
      const importedData = JSON.parse(result.toString());
      tabs[activeTab.value].title = importedData.title || 'Untitled';
      tabs[activeTab.value].content = importedData.content;
    }
  };
  reader.readAsText(file);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
</script>

<style scoped>
/* You can add any scoped styles here if needed */
</style>