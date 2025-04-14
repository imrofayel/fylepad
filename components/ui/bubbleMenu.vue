<template>
      <bubble-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div
          class="flex overflow-hidden dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50  bg-white border border-gray-200 rounded-xl text-black drop-shadow-cool dark:text-white/85">
          <button @click="editor.chain().focus().toggleBold().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('bold') }"
            class="rounded-l-lg hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleItalic().run()"
            :class="{ 'bg-gray-200/50 dark:bg-[#171717]': editor.isActive('italic') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">

            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 4h-9m4 16H5M15 4L9 20" class="relative top-0.5" />
            </svg>

          </button>
          <button @click="editor.chain().focus().toggleStrike().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('strike') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">


            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6m-2-8h16" class="relative top-0.5" />
            </svg>

          </button>

          <button @click="setLink"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('link') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">


            <svg width="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.5 14.5L14.5 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            vector-effect="non-scaling-stroke"></path>
          <path
            d="M16.8463 14.6095L19.4558 12C21.5147 9.94112 21.5147 6.60302 19.4558 4.54415C17.397 2.48528 14.0589 2.48528 12 4.54415L9.39045 7.1537M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.3969 2.48528 14.0588 4.54416 12L7.1537 9.39045"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" vector-effect="non-scaling-stroke"></path>
        </svg>

          </button>

          <button @click="editor.chain().focus().toggleHighlight().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('highlight') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">
            <div class="w-5 h-5 bg-yellow-400 dark:bg-yellow-500 rounded-full border dark:border-none border-black/50">
            </div>
          </button>

          <button @click="readSelectedText"
            :class="{ 'is-reading': isReading, 'hover:dark:bg-[#171717] hover:bg-gray-100': true, 'p-2 px-2 border-l border-gray-200 dark:border-[#525252]': true }"
            aria-label="Read selected text aloud"
            :aria-pressed="isReading"
            role="button">
            
            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>

            <div v-if="isReading" class="speech-wave">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>
          </button>

          <button @click="toggleVoiceSettings" 
            :class="{ 'is-active': showVoiceSettings, 'hover:dark:bg-[#171717] hover:bg-gray-100': true, 'p-2 px-2 border-l border-gray-200 dark:border-[#525252]': true }"
            aria-label="Voice settings"
            :aria-expanded="showVoiceSettings"
            role="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </bubble-menu>

      <!-- Voice Settings Panel -->
      <div v-if="showVoiceSettings" 
           class="voice-settings-panel dark:bg-[#232323] dark:border-[#444444] dark:text-gray-100 !z-[1100000]" 
           role="dialog" 
           aria-label="Voice settings">
        <div class="voice-panel-header">
          <h3 class="text-sm font-medium">Voice Settings</h3>
          <button @click="(e) => toggleVoiceSettings(e)" class="close-btn" aria-label="Close voice settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="voice-controls">
          <div class="form-group">
            <label for="voice-select" class="text-xs">Voice:</label>
            <select id="voice-select" v-model="selectedVoice" class="voice-select dark:bg-[#333333] dark:border-[#555555]">
              <option v-for="voice in availableVoices" :key="voice.name" :value="voice">
                {{ voice.name }} ({{ voice.lang }})
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="rate-slider" class="text-xs">Speed: {{ voiceRate.toFixed(1) }}x</label>
            <input type="range" id="rate-slider" min="0.5" max="2" step="0.1" v-model="voiceRate"
              class="rate-slider dark:bg-[#333333]"
              aria-valuemin="0.5" aria-valuemax="2" :aria-valuenow="voiceRate">
          </div>
          
          <div class="keyboard-shortcuts">
            <div class="text-xs font-medium mb-1">Keyboard Shortcuts:</div>
            <div class="text-xs">Alt + S: Start/Stop reading</div>
            <div class="text-xs">Alt + P: Pause/Resume</div>
          </div>
        </div>
      </div>

      <!-- Mini Controls -->
      <div v-if="isReading" class="mini-controls dark:bg-[#232323] dark:text-gray-100">
        <div class="reading-status text-xs">Reading: {{ readingProgressPercent }}%</div>
        <div class="control-buttons">
          <button @click="pauseReading" class="control-btn" aria-label="Pause/Resume reading">
            <svg v-if="isPaused" xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <button @click="stopReading" class="control-btn" aria-label="Stop reading">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16"></rect>
            </svg>
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="isReading" class="progress-container">
        <div class="progress-bar" :style="{ width: `${readingProgress}%` }"></div>
      </div>
</template>

<script lang="ts" setup>
import { BubbleMenu } from '@tiptap/vue-3';
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

// Define types
interface SpeechSynthesisVoice {
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
  default: boolean;
}

const props = defineProps({
  editor: {
    type: Object,
    required: true
  }
})

// State management
const isReading = ref(false);
const isPaused = ref(false);
const showVoiceSettings = ref(false);
const availableVoices = ref<SpeechSynthesisVoice[]>([]);
const selectedVoice = ref<SpeechSynthesisVoice | null>(null);
const voiceRate = ref(1);
const readingProgress = ref(0);
const readingDuration = ref(0);
const readingStartTime = ref(0);
const currentWord = ref(0);
const words = ref<string[]>([]);
const currentTextRange = ref<{from: number, to: number} | null>(null);

// Computed properties
const readingProgressPercent = computed(() => {
  return Math.round(readingProgress.value);
});

// Load voices
const loadVoices = () => {
  availableVoices.value = window.speechSynthesis.getVoices();
  if (availableVoices.value.length > 0) {
    // Try to set default voice to user's language
    const userLang = navigator.language || 'en-US';
    const matchingVoice = availableVoices.value.find(v => v.lang.includes(userLang.split('-')[0]));
    selectedVoice.value = matchingVoice || availableVoices.value[0];
  }
};

// Load saved preferences
const loadPreferences = () => {
  const savedVoice = localStorage.getItem('selectedVoice');
  const savedRate = localStorage.getItem('voiceRate');
  
  if (savedRate) {
    voiceRate.value = parseFloat(savedRate);
  }
  
  if (savedVoice && availableVoices.value.length > 0) {
    const voiceIndex = availableVoices.value.findIndex(v => v.name === savedVoice);
    if (voiceIndex >= 0) {
      selectedVoice.value = availableVoices.value[voiceIndex];
    }
  }
};

// Voice settings
const toggleVoiceSettings = (event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  showVoiceSettings.value = !showVoiceSettings.value;
};

// Remove current highlights
const removeHighlights = () => {
  if (!props.editor || !currentTextRange.value) return;
  
  try {
    // Clear any previous highlighting
    props.editor.commands.unsetHighlight();
  } catch (e) {
    console.error('Error removing highlights:', e);
  }
};

// Reading controls
const pauseReading = () => {
  if (isPaused.value) {
    window.speechSynthesis.resume();
  } else {
    window.speechSynthesis.pause();
  }
  isPaused.value = !isPaused.value;
};

const stopReading = () => {
  window.speechSynthesis.cancel();
  isReading.value = false;
  isPaused.value = false;
  readingProgress.value = 0;
  removeHighlights();
};

// Text reading
const readSelectedText = () => {
  if (!props.editor) return;
  
  // Save the current selection range
  const { from, to } = props.editor.state.selection;
  currentTextRange.value = { from, to };
  
  const selectedText = props.editor.state.selection.content().content.firstChild?.textContent;
  if (!selectedText) return;

  if (isReading.value) {
    stopReading();
    return;
  }

  // Split text into words
  words.value = selectedText.split(/\s+/);
  currentWord.value = 0;
  isReading.value = true;
  readingStartTime.value = Date.now();
  
  // Estimate reading duration
  const wordCount = words.value.length;
  readingDuration.value = (wordCount / 150) * 60 * 1000; // in milliseconds
  
  const utterance = new SpeechSynthesisUtterance(selectedText);
  
  // Apply voice settings
  if (selectedVoice.value) {
    utterance.voice = selectedVoice.value;
  }
  utterance.rate = voiceRate.value;
  
  // Try to detect language
  try {
    const langCode = selectedVoice.value?.lang || navigator.language || 'en-US';
    utterance.lang = langCode;
  } catch (e) {
    console.log('Language detection failed:', e);
  }
  
  // Word boundary tracking for highlighting
  utterance.onboundary = (event: SpeechSynthesisEvent) => {
    if (event.name === 'word' && currentTextRange.value) {
      // Update current word index
      currentWord.value = Math.min(
        words.value.length - 1, 
        Math.floor(event.charIndex / 5) // Rough approximation
      );
      
      // Update progress
      const elapsed = Date.now() - readingStartTime.value;
      readingProgress.value = Math.min(100, (elapsed / readingDuration.value) * 100);
      
      // Highlighting the current word (approximate)
      try {
        const wordLength = words.value[currentWord.value].length;
        const charOffset = event.charIndex;
        
        // Use the editor's selection to highlight the current word
        const from = currentTextRange.value.from + charOffset;
        const to = from + wordLength;
        
        // Highlight the current word
        removeHighlights();
        props.editor.commands.setTextSelection({ from, to });
        props.editor.commands.setHighlight();
        
        // Auto-scroll
        const view = props.editor.view;
        const domPos = view.coordsAtPos(from);
        
        if (domPos) {
          window.scrollTo({
            top: domPos.top - 100,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.error('Error highlighting text:', e);
      }
    }
  };
  
  utterance.onend = () => {
    isReading.value = false;
    isPaused.value = false;
    readingProgress.value = 0;
    removeHighlights();
    
    // Restore original selection
    if (currentTextRange.value) {
      props.editor.commands.setTextSelection(currentTextRange.value);
    }
  };

  window.speechSynthesis.speak(utterance);
};

// Keyboard shortcuts
const handleKeyboardShortcuts = (event: KeyboardEvent) => {
  // Alt+S to start/stop reading selected text
  if (event.altKey && event.key === 's') {
    event.preventDefault();
    readSelectedText();
  }
  
  // Alt+P to pause/resume reading
  if (event.altKey && event.key === 'p' && isReading.value) {
    event.preventDefault();
    pauseReading();
  }
};

// Lifecycle hooks
onMounted(() => {
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
  loadVoices();
  loadPreferences();
  document.addEventListener('keydown', handleKeyboardShortcuts);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyboardShortcuts);
  // Make sure to cancel any ongoing speech when component is unmounted
  if (isReading.value) {
    window.speechSynthesis.cancel();
  }
});

// Save preferences
watch([selectedVoice, voiceRate], () => {
  if (selectedVoice.value) {
    localStorage.setItem('selectedVoice', selectedVoice.value.name);
  }
  localStorage.setItem('voiceRate', voiceRate.value.toString());
}, { deep: true });

const setLink = () => {
  if (!props.editor) return;

  const previousUrl = props.editor.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === '') {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  // update link
  try {
    props.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  } catch (e: any) {
    alert(e.message);
  }
};
</script>

<style>
/* Button effects */
button:has(svg) {
  transition: all 0.2s ease;
  position: relative;
}

button:has(svg):hover {
  transform: scale(1.05);
}

/* Reading button animation */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

button.is-reading {
  background-color: rgba(36, 216, 108, 0.15);
}

button.is-active {
  background-color: rgba(59, 130, 246, 0.15);
}

/* Wave animation under the speaker icon */
.speech-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  height: 6px;
  z-index: 5;
}

.speech-wave .bar {
  width: 2px;
  background-color: currentColor;
  border-radius: 1px;
}

.speech-wave .bar:nth-child(1) { 
  height: 8px; 
  animation: wave 0.8s ease-in-out infinite; 
}
.speech-wave .bar:nth-child(2) { 
  height: 16px; 
  animation: wave 0.8s ease-in-out 0.1s infinite; 
}
.speech-wave .bar:nth-child(3) { 
  height: 24px; 
  animation: wave 0.8s ease-in-out 0.2s infinite; 
}
.speech-wave .bar:nth-child(4) { 
  height: 16px; 
  animation: wave 0.8s ease-in-out 0.3s infinite; 
}
.speech-wave .bar:nth-child(5) { 
  height: 8px; 
  animation: wave 0.8s ease-in-out 0.4s infinite; 
}

@keyframes wave {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

/* Micro icon animation */
.wave-path {
  opacity: 0;
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: draw 1.5s infinite alternate;
}

@keyframes draw {
  0% { 
    opacity: 0; 
    stroke-dashoffset: 30;
  }
  100% { 
    opacity: 0.7; 
    stroke-dashoffset: 0;
  }
}

/* Voice settings panel */
.voice-settings-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 250px;
}

.voice-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #eee;
}

.dark .voice-panel-header {
  border-bottom-color: #444;
}

.close-btn {
  padding: 2px;
  border-radius: 4px;
  line-height: 0;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.voice-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.voice-select {
  width: 100%;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.rate-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  appearance: none;
  background: #eee;
  outline: none;
}

.rate-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
}

.keyboard-shortcuts {
  padding-top: 4px;
  margin-top: 4px;
  border-top: 1px solid #eee;
}

.dark .keyboard-shortcuts {
  border-top-color: #444;
}

/* Mini controls */
.mini-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1000;
  border: 1px solid #eee;
  min-width: 120px;
}

.dark .mini-controls {
  border-color: #444;
}

.reading-status {
  margin-bottom: 4px;
}

.control-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.control-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .control-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Progress bar */
.progress-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: rgba(200, 200, 200, 0.3);
  z-index: 1000;
}

.progress-bar {
  height: 100%;
  background-color: #24d86c;
  transition: width 0.3s linear;
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>