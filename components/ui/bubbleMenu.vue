<template>
      <bubble-menu :editor="editor as any" :tippy-options="{ duration: 100 }" v-if="editor">
        <div
          class="flex overflow-hidden dark:bg-[#404040] dark:border-[#525252] dark:text-gray-50  bg-white border border-gray-200 rounded-xl text-black drop-shadow-cool dark:text-white/85">
          <!-- AI Button -->
          <button @click="openAIBar" style="background: #e0f2fe; border: 2px solid #2563eb; color: #2563eb; z-index: 9999;" class="hover:bg-blue-100 dark:hover:bg-blue-900 p-2 px-2 flex items-center" aria-label="AI Edit">
  <!-- Always visible for debug -->
            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#3b82f6" stroke-width="2" fill="none"/>
              <path d="M8 12h8M12 8v8" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
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

          <button @click="editor.chain().focus().toggleUnderline().run()"
            :class="{ 'bg-gray-100 dark:bg-[#171717]': editor.isActive('underline') }"
            class="hover:dark:bg-[#171717] hover:bg-gray-100 p-2 px-2">


            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24"><!-- Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16"/></svg>

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
            
            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24"><!-- Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2m7 9v3"/></g></svg>
          </button>

          <button @click="toggleVoiceSettings" 
            :class="{ 'is-active': showVoiceSettings, 'hover:dark:bg-[#171717] hover:bg-gray-100': true, 'p-2 px-2 border-gray-200 dark:border-[#525252]': true }"
            aria-label="Voice settings"
            :aria-expanded="showVoiceSettings"
            role="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="21" viewBox="0 0 24 24"><!-- Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2"/><circle cx="12" cy="12" r="3"/></g></svg>
          </button>
        </div>
      </bubble-menu>

      <!-- AI Prompt Bar -->
      <transition name="fade-slide">
        <div v-if="showAIBar" class="ai-bar-wrapper" style="border: 2px solid #f59e42; z-index: 99999; background: #fffbe8; position: absolute; top: 60px; left: 1500px; width: 100%; box-shadow: 0 4px 16px #f59e4299;">
          <div class="ai-bar-inner">
            <input
              ref="aiInput"
              v-model="aiPrompt"
              @keydown.enter="submitAIPrompt"
              :disabled="aiLoading"
              class="ai-bar-input"
              placeholder="Describe how you want to edit the selected text..."
              autofocus
            />
            <button @click="submitAIPrompt" :disabled="aiLoading || !aiPrompt.trim()" class="ai-bar-go">
              <span v-if="!aiLoading">Go</span>
              <span v-else class="ai-bar-spinner"></span>
            </button>
            <button @click="closeAIBar" class="ai-bar-close" :disabled="aiLoading">×</button>
          </div>
        </div>
      </transition>


      <!-- Mini Controls -->
      <div v-if="isReading" class="mini-controls rainbow-border-effect dark:bg-[#404040] bg-white/80 backdrop-blur-xl text-black !rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out">
                  
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center w-full justify-between gap-1">
                <button @click="pauseReading" class="play-pause-btn" aria-label="Pause/Resume reading">
                  <svg v-if="isPaused" xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24" fill="black" class="dark:!fill-white">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24" fill="black" class="dark:!fill-white">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                </button>

                <div class="audio-visualizer">
              <div v-for="i in 30" :key="i" class="visualizer-bar" 
                  :style="{ height: `${audioVisualizerHeight[i % audioVisualizerHeight.length] + 4}px` }"></div>
            </div>

            <div class="font-medium dark:text-white/95">{{ voiceRate }}x</div>
              </div>
            </div>
          </div>
        </div>

      <!-- Voice Settings Panel -->
      <div v-if="showVoiceSettings" 
           class="voice-settings-panel dark:!bg-[#404040] rounded-3xl border bg-white dark:text-white dark:border-[#525252] text-black !z-[1100000]" 
           role="dialog" 
           aria-label="Voice settings">
        <div class="flex items-center justify-between">
          <h3 class="text-lg opacity-95 font-medium">Voice Settings</h3>
          <button @click="(e) => toggleVoiceSettings(e)" class="close-btn relative -top-2" aria-label="Close voice settings">
            ×
          </button>
        </div>
        <div class="voice-controls">
          <div class="form-group pt-3">
            <select id="voice-select" v-model="selectedVoice" class="border p-2 rounded-xl dark:!bg-white/5 bg-white dark:border-[#525252] border-gray-300">
              <option v-for="voice in availableVoices" :key="voice.name" :value="voice">
                {{ voice.name }} ({{ voice.lang }})
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="text-md opacity-95">Speed:</label>
            <div class="speed-controls flex flex-wrap gap-2 mt-2">
              <button 
                v-for="rate in [0.5, 0.9, 1.0, 1.25, 1.5, 2]" 
                :key="rate" 
                @click="setVoiceRate(rate)"
                :class="{'border bg-[#24d86c] text-white !text-opacity-100 !drop-shadow-sm dark:border-none dark:!bg-black/20': Math.abs(voiceRate - rate) < 0.01}"
                class="border dark:border-none dark:bg-white/5 !px-2 rounded-2xl py-1 text-opacity-90">
                {{ rate }}x
              </button>
            </div>
          </div>
          
          <div class="flex flex-col border-t mt-2 pt-4 !gap-2">
            <div class="text-sm roboto-mono">Alt + S: Start / Stop reading</div>
            <div class="text-sm roboto-mono">Alt + P: Pause / Resume</div>
          </div>
        </div>
      </div>
</template>

<script lang="ts" setup>
import { BubbleMenu } from '@tiptap/vue-3';
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

// --- AI Bubble Menu State ---
const showAIBtn = ref(false);
const showAIBar = ref(false);
const aiPrompt = ref('');
const aiLoading = ref(false);
const aiInput = ref<HTMLInputElement | null>(null);


// --- Bubble Menu selection watcher ---
const updateAIBtn = () => {
  if (!props.editor) return;
  const { from, to } = props.editor.state.selection;
  showAIBtn.value = from !== to;
  console.log('[AI Button Debug] Selection from:', from, 'to:', to, 'showAIBtn:', showAIBtn.value);
};

onMounted(() => {
  if (props.editor) {
    props.editor.on('selectionUpdate', updateAIBtn);
    updateAIBtn();
  }
});
onBeforeUnmount(() => {
  if (props.editor) props.editor.off('selectionUpdate', updateAIBtn);
});

function openAIBar() {
  showAIBar.value = true;
  aiPrompt.value = '';
  console.log('[AI Debug] openAIBar called, showAIBar:', showAIBar.value);
  nextTick(() => aiInput.value?.focus());
}
function closeAIBar() {
  showAIBar.value = false;
  aiPrompt.value = '';
}

async function submitAIPrompt() {
  if (!props.editor || aiLoading.value || !aiPrompt.value.trim()) return;
  const { from, to } = props.editor.state.selection;
  const selectedText = props.editor.state.doc.textBetween(from, to, ' ');
  if (!selectedText) return;
  aiLoading.value = true;
  try {
    const response = await fetch('/api/ai-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: selectedText, prompt: aiPrompt.value.trim() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI error');
    const aiResult = data.result;
    if (aiResult) {
      props.editor.chain().focus().insertContentAt({ from, to }, aiResult).run();
      closeAIBar();
    }
  } catch (e) {
    if (typeof e === 'object' && e && 'message' in e) {
      alert('AI error: ' + (e as any).message);
    } else {
      alert('AI error: ' + String(e));
    }
  } finally {
    aiLoading.value = false;
  }
}

// --- Keyboard shortcut: Escape to close AI bar ---
function onGlobalKey(e: KeyboardEvent) {
  if (showAIBar.value && e.key === 'Escape') closeAIBar();
}
onMounted(() => window.addEventListener('keydown', onGlobalKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKey));

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
const audioVisualizerHeight = ref<number[]>([4, 8, 12, 16, 20, 16, 12, 8, 4]);
const currentWordDisplay = ref('');
const isMinimized = ref(false);

// Computed properties
const readingProgressPercent = computed(() => {
  return Math.round(readingProgress.value);
});

const readingDurationFormatted = computed(() => {
  const elapsed = Date.now() - readingStartTime.value;
  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
  isMinimized.value = false;
  removeHighlights();
  
  // Reset current selection
  if (currentTextRange.value && props.editor) {
    try {
      props.editor.commands.setTextSelection(currentTextRange.value);
    } catch (e) {
      console.error('Error restoring selection:', e);
    }
  }
};

// Text reading
const readSelectedText = () => {
  if (!props.editor) return;
  
  try {
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
    isPaused.value = false;
    isMinimized.value = false;
    readingStartTime.value = Date.now();
    
    // Estimate reading duration
    const wordCount = words.value.length;
    readingDuration.value = (wordCount / 150) * 60 * 1000; // in milliseconds
    
    // Start visualizer animation
    startVisualizerAnimation();
    
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
          if (props.editor && !isMinimized.value) { // Only highlight when not minimized
            const from = currentTextRange.value.from + charOffset;
            const to = from + wordLength;
            
            props.editor.commands.setTextSelection({ from, to });
            
            // Auto-scroll only if not minimized
            const view = props.editor.view;
            const domPos = view.coordsAtPos(from);
            
            if (domPos) {
              window.scrollTo({
                top: domPos.top - 100,
                behavior: 'smooth'
              });
            }
          }
        } catch (e) {
          console.error('Error highlighting text:', e);
        }
      }
    };
    
    utterance.onend = () => {
      isReading.value = false;
      isPaused.value = false;
      isMinimized.value = false;
      readingProgress.value = 0;
      
      // Restore original selection
      if (currentTextRange.value && props.editor) {
        try {
          props.editor.commands.setTextSelection(currentTextRange.value);
        } catch (e) {
          console.error('Error restoring selection:', e);
        }
      }
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Error in readSelectedText:', e);
    // Reset state in case of error
    isReading.value = false;
    isPaused.value = false;
    isMinimized.value = false;
  }
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

// Visual equalizer animation
const startVisualizerAnimation = () => {
  let animationFrameId: number;
  const updateVisualizer = () => {
    if (!isReading.value) return;
    
    // Create a random equalizer effect
    audioVisualizerHeight.value = audioVisualizerHeight.value.map(() => {
      return isPaused.value 
        ? 5 // Lower static height when paused
        : Math.floor(Math.random() * 20) + 5; // Random height between 5-25px when playing
    });
    
    // Update current word for display
    if (words.value.length > 0 && currentWord.value < words.value.length) {
      // Show current word and a few surrounding words for context
      const startIdx = Math.max(0, currentWord.value - 1);
      const endIdx = Math.min(words.value.length, currentWord.value + 4);
      const snippet = words.value.slice(startIdx, endIdx).join(' ');
      currentWordDisplay.value = snippet.length > 40 
        ? snippet.substring(0, 37) + '...' 
        : snippet;
    }
    
    // Continue animation
    if (isReading.value) {
      animationFrameId = requestAnimationFrame(updateVisualizer);
    }
  };
  
  animationFrameId = requestAnimationFrame(updateVisualizer);
  
  // Cleanup function to cancel animation when stopped
  const cleanupAnimation = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
  
  // Properly clean up the animation when component is unmounted
  onBeforeUnmount(cleanupAnimation);
};

// Speed controls
const setVoiceRate = (rate: number) => {
  voiceRate.value = rate;
  
  if (window.speechSynthesis.speaking) {
    // Cancel and restart with new rate
    const wasPaused = isPaused.value;
    
    // Store current position and restart
    const currentPos = window.speechSynthesis.speaking 
      ? Math.floor((Date.now() - readingStartTime.value) / readingDuration.value * words.value.length)
      : currentWord.value;
    
    window.speechSynthesis.cancel();
    
    // Only restart if we were actually speaking
    if (currentTextRange.value && words.value.length > 0) {
      // Get text from current position to end
      const remainingText = words.value.slice(currentPos).join(' ');
      if (remainingText) {
        const newUtterance = new SpeechSynthesisUtterance(remainingText);
        if (selectedVoice.value) {
          newUtterance.voice = selectedVoice.value;
        }
        newUtterance.rate = voiceRate.value;
        
        // Set the language
        try {
          const langCode = selectedVoice.value?.lang || navigator.language || 'en-US';
          newUtterance.lang = langCode;
        } catch (e) {
          console.log('Language detection failed:', e);
        }
        
        // Update current position
        currentWord.value = currentPos;
        
        // Speak and pause if needed
        window.speechSynthesis.speak(newUtterance);
        if (wasPaused) {
          window.speechSynthesis.pause();
          isPaused.value = true;
        }
      }
    }
  }
  
  // Save to localStorage
  localStorage.setItem('voiceRate', voiceRate.value.toString());
};
</script>

<style>
/* Button effects */
/* button:has(svg) {
  transition: all 0.2s ease;
  position: relative;
}

button:has(svg):hover {
  transform: scale(1.05);
} */

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

/* Mini controls */
.mini-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 320px;
  max-width: calc(100vw - 40px);
  transform-origin: bottom right;
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.mini-progress-track {
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.2);
}

.audio-visualizer {
  display: flex;
  align-items: center;
  justify-items: center;
  gap: 2.8px;
  /* height: 40px; */
}

.audio-visualizer-mini {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 40px;
}

.visualizer-bar {
  width: 4px;
  border-radius: 100px;
  background-color: #cfcece;
  transition: height 0.1s ease-in-out;
}

.play-pause-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: opacity 0.3s;
}

.play-pause-btn:hover {
  opacity: 0.8;
}

.speed-options {
  display: flex;
  gap: 4px;
}

.speed-option-btn {
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 3px;
  opacity: 0.6;
  transition: all 0.2s;
}

.speed-option-btn:hover {
  opacity: 0.8;
}

.active-speed {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.15);
  font-weight: 500;
}

.mini-player-collapsed {
  display: flex;
  align-items: center;
}

/* Voice settings panel */
.voice-settings-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  z-index: 1000;
  width: 400px;
  max-width: 90vw;
}

.voice-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  font-size: 24px;
  line-height: 1;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.voice-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.voice-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.speed-option {
  padding: 6px 10px;
  border-radius: 20px;
  background-color: #f5f5f5;
  font-size: 14px;
  transition: all 0.2s;
}

.speed-option:hover {
  background-color: #e5e5e5;
}

.active-speed-option {
  background-color: #24d86c;
  color: white;
}

.keyboard-shortcuts {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #eee;
}

/* Rainbow border animation */
@keyframes rainbowBorder {
  0%, 100% { 
    border-color: hsl(0, 80%, 70%); 
    box-shadow: 0 0 10px 2px hsla(0, 80%, 70%, 0.7); 
  }
  16% { 
    border-color: hsl(60, 80%, 70%); 
    box-shadow: 0 0 10px 2px hsla(60, 80%, 70%, 0.7); 
  }
  33% { 
    border-color: hsl(120, 80%, 70%); 
    box-shadow: 0 0 10px 2px hsla(120, 80%, 70%, 0.7); 
  }
  50% { 
    border-color: hsl(180, 80%, 70%); 
    box-shadow: 0 0 10px 2px hsla(180, 80%, 70%, 0.7); 
  }
  66% { 
    border-color: hsl(240, 80%, 70%); 
    box-shadow: 0 0 10px 2px hsla(240, 80%, 70%, 0.7); 
  }
  83% { 
    border-color: hsl(300, 80%, 70%); 
    box-shadow: 0 0 10px 2px hsla(300, 80%, 70%, 0.7); 
  }
}

.rainbow-border-effect {
  animation: rainbowBorder 4s linear infinite;
  border-width: 3px;
  border-style: solid; /* Ensure border is visible */
  border-radius: 10px; /* Optional: Soften edges for a smoother glow */
}
.ai-bar-wrapper {
  position: absolute;
  left: 50%;
  top: -60px;
  transform: translateX(-50%);
  z-index: 2000;
  width: 420px;
  max-width: 94vw;
  pointer-events: all;
}
.ai-bar-inner {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 18px 0 rgba(0,0,0,0.13);
  border: 1.5px solid #3b82f6;
  padding: 6px 10px;
  gap: 8px;
  animation: fadeInScale 0.25s cubic-bezier(.4,2,.6,1) both;
}
.ai-bar-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 1.08rem;
  padding: 7px 10px;
  background: transparent;
  color: #222;
}
.ai-bar-go {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 7px 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s;
  min-width: 48px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-bar-go:disabled {
  background: #b3d2fa;
  cursor: not-allowed;
}
.ai-bar-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
  border-radius: 6px;
  transition: background 0.15s;
}
.ai-bar-close:hover {
  background: #f3f3f3;
}
.ai-bar-spinner {
  border: 3px solid #e0e7ef;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 21px;
  height: 21px;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95) translateX(-50%); }
  to { opacity: 1; transform: scale(1) translateX(-50%); }
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.22s, transform 0.22s cubic-bezier(.4,2,.6,1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(25px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Existing styles below */
</style>