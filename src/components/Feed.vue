<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStores'
import { RouterLink } from 'vue-router'
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { getApp } from 'firebase/app'

const app = getApp()
const db = getFirestore(app)
const postsCollection = collection(db, 'posts')

const userStore = useUserStore()
const newPost = ref('')
const posts = ref([])

onMounted(() => {
  const postsQuery = query(postsCollection, orderBy('timestamp', 'desc'))
  onSnapshot(postsQuery, snapshot => {
    posts.value = snapshot.docs
      .filter(doc => doc.data().user !== userStore.currentUser)
      .map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const submitPost = async () => {
  if (!newPost.value.trim() || !userStore.isLoggedIn) return
  try {
    await addDoc(postsCollection, {
      user: userStore.currentUser,
      content: newPost.value,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      timestamp: serverTimestamp()
    })
    userStore.postCount += 1
    newPost.value = ''
  } catch (error) {
    console.error('Error adding post: ', error)
  }
}
</script>

<template>
  <div class="center_page">
    <div class="wrapper">
      <div v-if="userStore.isLoggedIn" class="new_post_box">
        <textarea v-model="newPost" placeholder="Post something!"></textarea>
        <button @click="submitPost">Post</button>
      </div>
      <div v-else class="login_prompt">
        <p>Please <RouterLink to="/login">log in</RouterLink> to post.</p>
      </div>

      <div v-for="post in posts" :key="post.id" class="user_post_box">
        <RouterLink class="post_user" :to="`/UserProfile/${post.user}`">
          {{ post.user }}
        </RouterLink>
        <div class="post_content">{{ post.content }}</div>
        <div class="post_info">
          Posted on {{ post.date }}, {{ post.time }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.center_page { 
  text-align: center; 
}

.wrapper { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(min-content, max-content)); 
  gap: 20px; 
  padding: 0 10px; 
  justify-content: center; 
  align-items: start; 
  margin: 0 auto; 
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

.login_prompt { 
  width: 800px; 
  margin-bottom: 20px; 
  padding: 20px; 
  border: 2px dashed var(--color-border); 
  border-radius: 10px; 
  background-color: var(--color-background); 
  font-size: 1.1rem; 
}

.user_post_box { 
  position: relative; 
  border: 3px solid var(--color-border); 
  border-radius: 10px; 
  background-color: var(--color-background); 
  padding: 40px 15px 15px; 
  text-align: left; 
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

.post_content { 
  font-size: 1.2rem; 
  color: var(--color-text); 
  margin-top: 10px; 
}

.post_info { 
  margin-top: 8px; 
  font-size: 0.9rem; 
  color: var(--color-muted); 
}

</style>
