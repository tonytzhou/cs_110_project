<template>
  <div class="screenshot_box">
    <button class="screenshot_btn" @click="downloadScreenshot">
      📸 Screenshot Feed
    </button>
    <button class="screenshot_btn" @click="onToggleComments">
      Toggle Comments
    </button>
    <button class="screenshot_btn" @click="onToggleFavCount">
      Toggle Fav Counts
    </button>
    <button class="screenshot_btn" @click="onToggleTimestamp">
      Toggle Timestamp
    </button>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps({
  feedWrapper: { type: Object, required: true }, 
  onToggleComments: Function,
  onToggleFavCount: Function,
  onToggleTimestamp: Function
})

async function downloadScreenshot() {
  const el = props.feedWrapper.value ?? props.feedWrapper
  if (!el) {
    console.warn('ScreenshotButton: feedWrapper element is missing')
    return
  }

  try {
    const canvas = await html2canvas(el, {
      logging: false,
      useCORS: true,
      backgroundColor: null
    })

    canvas.toBlob(blob => {
      if (!blob) throw new Error('Failed to convert canvas to blob')
      const link = document.createElement('a')
      link.download = 'feed.png'
      link.href = URL.createObjectURL(blob)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    })
  } catch (err) {
    console.error('Screenshot failed:', err)
  }
}
</script>

<style scoped>
.screenshot_box {
  width: 300px;
  padding: 1rem;
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

.screenshot_btn {
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 6px;
  background-color: var(--color-border);
  cursor: pointer;
}
</style>