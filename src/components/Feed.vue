<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStores'

const userStore = useUserStore()

const newPost = ref('')
const posts = ref([
  {
    user: 'brrcrites39439@gmail.com',
    content: '1st post man!',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  },
  {
    user: 'brrcrites39439@gmail.com',
    content: '1st post man!',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  }
])

const submitPost = () => {
  if (newPost.value.trim() === '') return

  posts.value.unshift({
    user: userStore.currentUser,
    content: newPost.value,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  })

  newPost.value = ''
}
</script>

<template>
  <div class="center_page">
    <div class="wrapper">

        <template v-if="!userStore.isViewingAnotherUser">
      <div class="new_post_box">
        <textarea
          v-model="newPost"
          placeholder="Post something!"
        ></textarea>
        <button @click="submitPost">Post</button>
      </div>
      </template>
      <div v-for="(post, index) in posts":key="index" class="user_post_box">
      <RouterLink class="post_user":to="`/UserProfile/${post.user}`">{{ post.user }} </RouterLink>        
      <div class="post_content">{{ post.content }}</div>
        <div class="post_info">Posted on {{ post.date }}, {{ post.time }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
}

h3 {
  font-size: 1.2rem;
}

.center_page{
  text-align: center;
}

.wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min-content, max-content));
    gap: 20px;
    padding-right: 10px;
    padding-left: 10px;
    justify-content: center;
    align-items: start;
    margin: 0 auto;
}

.user_post_box {
  position: relative; 
  border: 3px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
  padding: 40px 15px 15px 15px; 
  text-align: left; 
  display: block;
  word-wrap: break-word;
  width: 800px;
  max-height: 300px;
}


.post_user {
  position: absolute;
  top: 10px;
  left: 15px;
  font-weight: bold;
  font-size: 1.3rem;
}

.post_info{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: left;
    justify-content: left;
}

.post_content{
    font-size: 1.2rem;
    color: var(--color-text);
}

.new_post_box {
  display: flex;
  flex-direction: column;
  width: 800px;
  margin-bottom: 20px;
  padding: 20px;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  background-color: var(--color-background);
}

.new_post_box textarea {
  resize: vertical;
  min-height: 80px;
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.new_post_box button {
  align-self: flex-end;
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

</style>
