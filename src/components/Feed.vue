<template>
  <div class="center_page">
    <div class="wrapper">

      <div v-if="userStore.isLoggedIn && !userStore.viewingUser" class="new_post_box">
        <textarea v-model="newPost" placeholder="Post something!"></textarea>
        <button @click="submitPost">Post</button>
      </div>

      <div v-else-if="!userStore.isLoggedIn" class="login_prompt">
        <p>Please <RouterLink to="/login">log in</RouterLink> to post.</p>
      </div>

      <div v-if="userStore.viewingUser && posts.length === 0" class="no_posts">
        This user has no posts.
      </div>

      <div v-for="post in posts" :key="post.id" class="user_post_box">
        <RouterLink class="post_user" :to="`/UserProfile/${post.user}`">
          {{ post.user }}
        </RouterLink>
        <div class="post_content">{{ post.content }}</div>
        <div class="post_info">
          Posted on {{ post.date }}, {{ post.time }}
        </div>

        <div class="favorite_controls">
          <button class="favorite_btn" @click="toggleFavorite(post)">
            <span v-if="favoritesMap[post.id]?.favorited">❇️</span>
            <span v-else>🟩</span>
          </button>
          <span class="favorites_count">
            {{ favoritesMap[post.id]?.count || 0 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/userStores'
import { getApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore'

const app = getApp()
const db = getFirestore(app)

const postsCollection = collection(db, 'posts')
const favoritesCollection = collection(db, 'favorites')

const userStore = useUserStore()
const newPost = ref('')
const posts = ref([])
const followingList = ref([])
const favoritesMap = ref({})

async function subscribeFeed() {
  if (userStore.viewingUser) {
    const q = query(
      postsCollection,
      where('user', '==', userStore.viewingUser),
      orderBy('timestamp', 'desc')
    )
    onSnapshot(q, snap =>
      (posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return
  }

  followingList.value = await userStore.fetchMyFollowingList()

  let q
  if (followingList.value.length > 0 && followingList.value.length <= 10) {
    q = query(
      postsCollection,
      where('user', 'in', followingList.value),
      orderBy('timestamp', 'desc')
    )
  } else {
    q = query(postsCollection, orderBy('timestamp', 'desc'))
  }

  onSnapshot(q, snap => {
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    posts.value =
      followingList.value.length > 0 && followingList.value.length <= 10
        ? all
        : all.filter(p => followingList.value.includes(p.user))
  })
}

function subscribeFavorites() {
  const favQuery = query(favoritesCollection)
  onSnapshot(favQuery, snap => {
    const map = {}
    snap.docs.forEach(d => {
      const { postId, user } = d.data()
      if (!map[postId]) {
        map[postId] = { count: 0, favorited: false, docIdMap: {} }
      }
      map[postId].count++
      map[postId].docIdMap[user] = d.id
    })
    Object.values(map).forEach(entry => {
      entry.favorited = !!entry.docIdMap[userStore.currentUser]
    })
    favoritesMap.value = map
  })
}

onMounted(() => {
  subscribeFeed()
  subscribeFavorites()
})

watch(() => userStore.viewingUser, () => {
  subscribeFeed()
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
    userStore.postCount++
    newPost.value = ''
  } catch (e) {
    console.error('Error adding post:', e)
  }
}

const toggleFavorite = async post => {
  if (!userStore.isLoggedIn) return
  const entry = favoritesMap.value[post.id] || { docIdMap: {} }
  if (entry.favorited) {
    const docId = entry.docIdMap[userStore.currentUser]
    await deleteDoc(doc(db, 'favorites', docId))
  } else {
    await addDoc(favoritesCollection, {
      postId: post.id,
      user: userStore.currentUser,
      timestamp: serverTimestamp()
    })
  }
}
</script>

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

.no_posts {
  width: 800px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.1rem;
  color: var(--color-muted);
  border: 2px dashed var(--color-border);
  border-radius: 10px;
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

.favorite_controls {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.favorite_btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.favorite_btn:focus {
  outline: none;
}

.favorites_count {
  margin-left: 8px;
  font-size: 1rem;
  color: var(--color-text);
}
</style>