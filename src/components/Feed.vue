<script setup>
import { ref, onMounted, watch, defineExpose, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useUserStore } from '../stores/userStores'
import { getApp } from 'firebase/app'
import html2canvas from 'html2canvas'
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
  serverTimestamp,
  documentId
} from 'firebase/firestore'

const route = useRoute()
const userStore = useUserStore()
const db = getFirestore(getApp())
const feedWrapper = ref(null)

const newPost = ref('')
const posts = ref([])
const allPosts = ref([])
const favoritesMap = ref({})
const commentsMap = ref({})
const commentTextMap = ref({})
const subscribedComments = new Set()

const favoritesEmail = computed(() =>
  route.params.email || userStore.currentUser
)

defineExpose({ downloadScreenshot })

async function downloadScreenshot() {
  if (!feedWrapper.value) return
  const canvas = await html2canvas(feedWrapper.value, {
    logging: false,
    useCORS: true
  })
  const link = document.createElement('a')
  link.download = 'feed.png'
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function subscribeComments(postId) {
  if (subscribedComments.has(postId)) return
  subscribedComments.add(postId)
  commentTextMap.value[postId] = ''

  const commentsCol = collection(db, 'posts', postId, 'comments')
  const q = query(commentsCol, orderBy('timestamp', 'asc'))
  onSnapshot(q, snap => {
    commentsMap.value[postId] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
}

function subscribeFeed() {
  if (route.name === 'UserFavorites') {
    const email = favoritesEmail.value
    if (!email) return

    const favQ = query(
      collection(db, 'favorites'),
      where('user', '==', email)
    )
    onSnapshot(favQ, snap => {
      const postIds = snap.docs.map(d => d.data().postId)
      if (postIds.length === 0) {
        posts.value = []
        return
      }
      const postsCol = collection(db, 'posts')
      const chunks = postIds.length > 10
        ? [postIds.slice(0, 10), postIds.slice(10)]
        : [postIds]
      const fetched = []
      chunks.forEach(chunk => {
        const pq = query(
          postsCol,
          where(documentId(), 'in', chunk),
          orderBy('timestamp', 'desc')
        )
        onSnapshot(pq, snap2 => {
          fetched.push(...snap2.docs.map(d => ({ id: d.id, ...d.data() })))
          posts.value = [...fetched]
          posts.value.forEach(p => subscribeComments(p.id))
        })
      })
    })
    return
  }

  if (route.name === 'Favorites') {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'))
    onSnapshot(q, snap => {
      allPosts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      posts.value = allPosts.value.filter(p => favoritesMap.value[p.id]?.favorited)
      posts.value.forEach(p => subscribeComments(p.id))
    })
    return
  }

  if (userStore.viewingUser) {
    const q = query(
      collection(db, 'posts'),
      where('user', '==', userStore.viewingUser),
      orderBy('timestamp', 'desc')
    )
    onSnapshot(q, snap => {
      posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
    return
  }

  userStore.fetchMyFollowingList().then(list => {
    let q
    if (list.length > 0 && list.length <= 10) {
      q = query(
        collection(db, 'posts'),
        where('user', 'in', list),
        orderBy('timestamp', 'desc')
      )
    } else {
      q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'))
    }
    onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      posts.value =
        list.length > 0 && list.length <= 10
          ? all
          : all.filter(p => list.includes(p.user))
    })
  })
}

function subscribeFavorites() {
  const favQ = query(collection(db, 'favorites'))
  onSnapshot(favQ, snap => {
    const map = {}
    snap.docs.forEach(d => {
      const { postId, user } = d.data()
      if (!map[postId]) map[postId] = { count: 0, favorited: false, docIdMap: {} }
      map[postId].count++
      map[postId].docIdMap[user] = d.id
    })
    Object.values(map).forEach(e => {
      e.favorited = !!e.docIdMap[userStore.currentUser]
    })
    favoritesMap.value = map
  })
}

onMounted(() => {
  if (route.name === 'home') userStore.viewingUser = null
  subscribeFavorites()
  subscribeFeed()
})

watch(() => userStore.isLoggedIn, loggedIn => {
  if (loggedIn) {
    userStore.viewingUser = null
    subscribeFavorites()
    subscribeFeed()
  }
})

watch(() => route.name, () => {
  if (route.name === 'home') userStore.viewingUser = null
  subscribeFeed()
})

const submitPost = async () => {
  if (!newPost.value.trim() || !userStore.isLoggedIn) return
  await addDoc(collection(db, 'posts'), {
    user: userStore.currentUser,
    content: newPost.value,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    timestamp: serverTimestamp()
  })
  userStore.postCount++
  newPost.value = ''
}

const submitComment = async postId => {
  const text = commentTextMap.value[postId]?.trim()
  if (!text || !userStore.isLoggedIn) return
  const commentsCol = collection(db, 'posts', postId, 'comments')
  await addDoc(commentsCol, {
    user: userStore.currentUser,
    content: text,
    timestamp: serverTimestamp()
  })
  commentTextMap.value[postId] = ''
}

const toggleFavorite = async post => {
  if (!userStore.isLoggedIn) return
  const entry = favoritesMap.value[post.id] || { docIdMap: {} }
  if (entry.favorited) {
    const docId = entry.docIdMap[userStore.currentUser]
    await deleteDoc(doc(db, 'favorites', docId))
  } else {
    await addDoc(collection(db, 'favorites'), {
      postId: post.id,
      user: userStore.currentUser,
      timestamp: serverTimestamp()
    })
  }
}
</script>

<template>
  <div class="center_page">
    <div class="wrapper" ref="feedWrapper">

      <div
        v-if="route.name !== 'Favorites' && route.name !== 'UserFavorites' && userStore.isLoggedIn && !userStore.viewingUser"
        class="new_post_box"
      >
        <textarea
          v-model="newPost"
          placeholder="Post something!"
        />
        <button @click="submitPost">Post</button>
      </div>

      <div
        v-else-if="route.name !== 'Favorites' && route.name !== 'UserFavorites' && !userStore.isLoggedIn"
        class="login_prompt"
      >
        <p>Please <RouterLink to="/login">log in</RouterLink> to post.</p>
      </div>

      <div
        v-if="userStore.viewingUser && posts.length === 0 && route.name !== 'UserFavorites'"
        class="no_posts"
      >
        This user has no posts.
      </div>

      <div v-for="post in posts" :key="post.id" class="user_post_box">
        <RouterLink
          class="post_user"
          :to="`/UserProfile/${post.user}`"
        >
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

        <div
          v-if="route.name === 'Favorites' || route.name === 'UserFavorites'"
          class="comments_section"
        >
          <div
            v-for="comment in commentsMap[post.id] || []"
            :key="comment.id"
            class="comment_item"
          >
            <span class="comment_user">{{ comment.user }}:</span>
            {{ comment.content }}
          </div>

          <div
            v-if="userStore.isLoggedIn && route.name === 'Favorites'"
            class="comment_input_box"
          >
            <input
              v-model="commentTextMap[post.id]"
              placeholder="Why did you favorite this post?"
            />
            <button class="btn-comment" @click="submitComment(post.id)">
              Comment
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="route.name === 'UserFavorites' && posts.length === 0"
        class="no_posts"
      >
        This user hasn’t favorited any posts yet.
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
}

.post_user {
  position: absolute;
  top: 10px;
  left: 15px;
  font-weight: bold;
  font-size: 1.3rem;
}

.post_content {
  margin-top: 10px;
  font-size: 1.2rem;
  color: var(--color-text);
}

.post_info {
  margin-top: 8px;
  font-size: 0.9rem;
  color: var(--color-muted);
}

.favorite_controls {
  display: flex;
  align-items: center;
  margin-top: 10px;
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

.comments_section {
  margin-top: 15px;
  width: 100%;
}

.comment_item {
  padding: 8px;
  border-top: 1px solid var(--color-border);
}

.comment_user {
  color: var(green);
  font-weight: bold;
  margin-right: 4px;
}

.comment_input_box {
  display: flex;
  margin-top: 10px;
}

.comment_input_box input {
  flex: 1;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-comment {
  margin-left: 8px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: var(--color-border);
  cursor: pointer;
}
</style>