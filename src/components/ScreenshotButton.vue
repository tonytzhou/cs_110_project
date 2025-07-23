<script setup>
import { defineProps } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps({
  feedWrapper: { type: Object, required: true },
  onToggleComments: Function,
  onToggleCommentBox: Function,
  onToggleFavCount: Function,
  onToggleTimestamp: Function,
  onToggleUser: Function,
  onRegularMode: Function,
  onProperMode: Function,
  onRainbowMode: Function,
  onOldenMode: Function,
  onToggleDecoration: Function,
  onToggleGutenberg: Function,
  onToggleTony: Function
})

async function downloadScreenshot(el) {
  if (!el) return

  const canvas = await html2canvas(el, {
    logging: false,
    useCORS: true,
    backgroundColor: null
  })

  canvas.toBlob(blob => {
    if (!blob) return
    const link = document.createElement('a')
    link.download = 'feed.png'
    link.href = URL.createObjectURL(blob)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  })
}


async function screenshotFullFeed() {
  await downloadScreenshot(props.feedWrapper.value ?? props.feedWrapper)
}

async function screenshotFirstFavorite() {
  const el = props.feedWrapper.value ?? props.feedWrapper
  const firstPost = el.querySelector('.user_post_box')
  if (firstPost) {
    await downloadScreenshot(firstPost)
  } else {
    alert('No posts available to screenshot.')
  }
}
</script>

<template>
  <div class="screenshot_box">
    <details class="dropdown">
      <summary class="dropdown_summary">Screenshot Options</summary>
    <button class="screenshot_btn" @click="screenshotFullFeed">Screenshot Feed 📸</button>
    <button class="screenshot_btn" @click="screenshotFirstFavorite">Screenshot First Favorite ⭐</button>
  </details>

    <details class="dropdown">
      <summary class="dropdown_summary">Toggles</summary>
      <button class="screenshot_btn" @click="onToggleComments">Toggle Comments 💬</button>
      <button class="screenshot_btn" @click="onToggleCommentBox">Toggle Comment Box 📝</button>
      <button class="screenshot_btn" @click="onToggleFavCount">Toggle Fav Counts ❇️</button>
      <button class="screenshot_btn" @click="onToggleTimestamp">Toggle Timestamp ⏰</button>
      <button class="screenshot_btn" @click="onToggleUser">Toggle User 👤</button>
    </details>

    <details class="dropdown">
      <summary class="dropdown_summary">Modes</summary>
      <button class="screenshot_btn" @click="onRegularMode">Regular Mode</button>
      <button class="screenshot_btn" @click="onProperMode">Proper Mode</button>
      <button class="screenshot_btn" @click="onRainbowMode">Rainbow Mode</button>
      <button class="screenshot_btn" @click="onOldenMode">Olden English Mode</button>
    </details>

    <details class="dropdown">
      <summary class="dropdown_summary">Decorations</summary>
      <button class="screenshot_btn" @click="onToggleDecoration">
        <img src="/coquette.png" alt="Coquette Bow" class="decoration_icon_btn" />
      </button>
      <button class="screenshot_btn" @click="onToggleTony">
        <img src="/tony.png" alt="Tony Decoration" class="decoration_icon_btn" />
      </button>
      <button class="screenshot_btn" @click="onToggleGutenberg">
        <img src="/johannes-gutenberg.png" alt="Gutenberg Decoration" class="decoration_icon_btn" />
      </button>
    </details>
  </div>
</template>

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
  gap: 1rem;
}

details.dropdown {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background);
  padding: 0.5rem;
}

.dropdown_summary::-webkit-details-marker { display: none; }
.dropdown_summary::marker { content: none; }

.dropdown_summary {
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin: 0;
  padding: 0.2rem 0;
  color: green;
}
.dropdown_summary::after {
  content: '▼';
  float: right;
  color: green;
}
details[open] > .dropdown_summary::after {
  content: '▲';
}

.screenshot_btn {
  margin-top: 0.5rem;
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 6px;
  background-color: var(--color-border);
  cursor: pointer;
  text-align: left;
  width: 100%;
}

.decoration_icon_btn {
  width: 24px;
  height: 24px;
}
</style>
