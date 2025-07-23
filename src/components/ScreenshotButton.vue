<script setup>
const { 
  onDownload,
  onToggleComments,
  onToggleFavCount
} = defineProps({
  onDownload: Function,
  onToggleComments: Function,
  onToggleFavCount: Function,
  onToggleTimestamp: Function
})
</script>

<template>
  <div class="screenshot_box">
    <button class="screenshot_btn" @click="onDownload">
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