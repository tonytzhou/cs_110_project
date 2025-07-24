<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useUserStore } from '../stores/userStores'
import { getApp } from 'firebase/app'
import ScreenshotButton from '@/components/ScreenshotButton.vue'
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
const isOwnFavoritesView = computed(() => route.name === 'Favorites')

const showComments = ref(true)
const showCommentBox = ref(true)
const showFavCount = ref(true)
const showTimestamp = ref(true)
const showUser = ref(true)
const showDecoration = ref(false)
const showGutenberg  = ref(false)
const showTony = ref(false)

const toggleComments = () => (showComments.value = !showComments.value)
const toggleCommentBox = () => (showCommentBox.value = !showCommentBox.value)
const toggleFavCount = () => (showFavCount.value = !showFavCount.value)
const toggleTimestamp = () => (showTimestamp.value = !showTimestamp.value)
const toggleUser= () => (showUser.value = !showUser.value)

const toggleDecoration = () => {
  const newVal = !showDecoration.value
  showDecoration.value = newVal
  if (newVal) {
    showGutenberg.value = false
    showTony.value = false
  }
}
const toggleGutenberg = () => {
  const newVal = !showGutenberg.value
  showGutenberg.value = newVal
  if (newVal) {
    showDecoration.value = false
    showTony.value = false
  }
}
const toggleTony = () => {
  const newVal = !showTony.value
  showTony.value = newVal
  if (newVal) {
    showDecoration.value = false
    showGutenberg.value  = false
  }
}

const mode = ref('regular')
const setRegularMode = () => (mode.value = 'regular')
const setProperMode = () => (mode.value = 'proper')
const setRainbowMode = () => (mode.value = 'rainbow')
const setOldenMode = () => (mode.value = 'olden')

const wrapperClass = computed(() => {
  switch (mode.value) {
    case 'proper': return 'proper-mode'
    case 'rainbow': return 'rainbow-mode'
    case 'olden': return 'olden-mode'
    default: return ''
  }
})

const newPost = ref('')
const posts = ref([])
const favoritesMap = ref({})
const commentsMap = ref({})
const commentTextMap = ref({})
const subscribedComments = new Set()
const favoritesEmail = computed(
  () => route.params.email || userStore.currentUser
)

// Subscribes to comments for a post
function subscribeComments(postId) {
  if (subscribedComments.has(postId)) return
  subscribedComments.add(postId)
  commentTextMap.value[postId] = ''
  const commentsCol = collection(db, 'posts', postId, 'comments')
  onSnapshot(
    query(commentsCol, orderBy('timestamp', 'asc')),
    (snap) => {
      commentsMap.value[postId] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    }
  )
}

// Subscribes to favorites
function subscribeFavorites() {
  onSnapshot(query(collection(db, 'favorites')), (snap) => {
    const m = {}
    snap.docs.forEach(d => {
      const { postId, user } = d.data()
      m[postId] ??= { count: 0, favorited: false, docIdMap: {} }
      m[postId].count++
      m[postId].docIdMap[user] = d.id
    })
    // Only set favorited for logged in user
    Object.values(m).forEach(e => {
      e.favorited = userStore.isLoggedIn ? !!e.docIdMap[userStore.currentUser] : false
    })
    favoritesMap.value = m
  })
}

// ALWAYS loads the feed, even when not logged in
function subscribeFeed() {
  if (route.name === 'UserFavorites') {
    const email = favoritesEmail.value
    if (!email) {
      posts.value = []
      return
    }
    onSnapshot(
      query(collection(db, 'favorites'), where('user', '==', email)),
      (snap) => {
        const ids = snap.docs.map(d => d.data().postId)
        if (!ids.length) {
          posts.value = []
          return
        }
        const postsCol = collection(db, 'posts')
        const chunks = ids.length > 10
          ? [ids.slice(0,10), ids.slice(10)]
          : [ids]
        let fetched = []
        chunks.forEach(chunk => {
          onSnapshot(
            query(postsCol,
                  where(documentId(), 'in', chunk),
                  orderBy('timestamp','desc')),
            (snap2) => {
              fetched = [
                ...fetched,
                ...snap2.docs.map(d => ({ id: d.id, ...d.data() }))
              ]
              posts.value = fetched
              posts.value.forEach(p => subscribeComments(p.id))
            }
          )
        })
      }
    )
    return
  }

  if (route.name === 'Favorites') {
    onSnapshot(
      query(collection(db, 'posts'), orderBy('timestamp','desc')),
      (snap) => {
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Only show favorited if logged in, otherwise show none
        posts.value = userStore.isLoggedIn
          ? all.filter(p => favoritesMap.value[p.id]?.favorited)
          : []
        posts.value.forEach(p => subscribeComments(p.id))
      }
    )
    return
  }

  if (userStore.viewingUser) {
    onSnapshot(
      query(collection(db, 'posts'),
            where('user','==', userStore.viewingUser),
            orderBy('timestamp','desc')),
      (snap) => {
        posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    )
    return
  }

  // For general feed, show ALL posts if not logged in
  if (!userStore.isLoggedIn) {
    onSnapshot(
      query(collection(db, 'posts'), orderBy('timestamp','desc')),
      (snap) => {
        posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      }
    )
    return
  }

  // If logged in, show following or everything
  userStore.fetchMyFollowingList().then(list => {
    let q
    if (list.length > 0 && list.length <= 10) {
      q = query(
        collection(db,'posts'),
        where('user','in', list),
        orderBy('timestamp','desc')
      )
    } else {
      q = query(collection(db,'posts'), orderBy('timestamp','desc'))
    }
    onSnapshot(q, (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      posts.value = (list.length > 0 && list.length <= 10)
        ? all
        : all.filter(p => list.includes(p.user))
    })
  })
}

onMounted(() => {
  subscribeFavorites()
  subscribeFeed()
})

watch(() => userStore.isLoggedIn, () => {
  subscribeFeed()
})
watch(() => route.name, () => subscribeFeed())

async function submitPost() {
  if (!newPost.value.trim() || !userStore.isLoggedIn) return
  await addDoc(collection(db,'posts'), {
    user: userStore.currentUser,
    content: newPost.value,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    timestamp: serverTimestamp()
  })
  userStore.postCount++
  newPost.value = ''
}

async function submitComment(postId) {
  const txt = commentTextMap.value[postId]?.trim()
  if (!txt || !userStore.isLoggedIn) return
  await addDoc(
    collection(db,'posts', postId,'comments'),
    { user: userStore.currentUser, content: txt, timestamp: serverTimestamp() }
  )
  commentTextMap.value[postId] = ''
}

async function toggleFavorite(post) {
  if (!userStore.isLoggedIn) return
  const entry = favoritesMap.value[post.id] || { docIdMap: {} }
  if (entry.favorited) {
    await deleteDoc(doc(db,'favorites', entry.docIdMap[userStore.currentUser]))
  } else {
    await addDoc(collection(db,'favorites'), {
      postId: post.id,
      user: userStore.currentUser,
      timestamp: serverTimestamp()
    })
  }
}
</script>

<template>
  <div class="center_page">
    <div class="wrapper" ref="feedWrapper" :class="wrapperClass">
      <!-- Only show post box if logged in and not in Favorites/UserFavorites and not viewing another user -->
      <div
        v-if="route.name !== 'Favorites' && route.name !== 'UserFavorites' && userStore.isLoggedIn && !userStore.viewingUser"
        class="new_post_box">
        <textarea v-model="newPost" placeholder="Post something!" />
        <button @click="submitPost">Post</button>
      </div>

      <div
        v-else-if="route.name !== 'Favorites' && route.name !== 'UserFavorites' && !userStore.isLoggedIn"
        class="login_prompt">
        <p>Please <RouterLink to="/login">log in</RouterLink> to post.</p>
      </div>

      <div
        v-if="userStore.viewingUser && posts.length === 0 && route.name !== 'UserFavorites'"
        class="no_posts">
        This user has no posts.
      </div>

      <div v-for="post in posts" :key="post.id" class="user_post_box">
        <img
          v-if="showDecoration"
          src="/coquette.png"
          alt="Coquette Decoration"
          class="post_decoration"
        />
        <img
          v-if="showTony"
          src="/tony.png"
          alt="Tony Decoration"
          class="tony_decoration"
        />
        <img
          v-if="showGutenberg"
          src="/johannes-gutenberg.png"
          alt="Gutenberg Decoration"
          class="gutenberg_decoration"
        />

        <RouterLink
          v-if="showUser"
          class="post_user"
          :to="`/UserProfile/${post.user}`"
        >
          {{ post.user }}
        </RouterLink>

        <div class="post_content">{{ post.content }}</div>

        <div v-if="showTimestamp" class="post_info">
          Posted on {{ post.date }}, {{ post.time }}
        </div>

        <div
          v-if="userStore.isLoggedIn"
          class="favorite_controls"
        >
          <button class="favorite_btn" @click="toggleFavorite(post)">
            <span
              v-if="showFavCount && favoritesMap[post.id]?.favorited"
              >❇️</span
            >
            <span
              v-else-if="showFavCount && !favoritesMap[post.id]?.favorited"
              >🟩</span
            >
          </button>
          <span v-if="showFavCount" class="favorites_count">
            {{ favoritesMap[post.id]?.count || 0 }}
          </span>
        </div>

        <div
          v-if="showComments &&
                (route.name === 'Favorites' || route.name === 'UserFavorites')"
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
            v-if="showCommentBox &&
                  userStore.isLoggedIn &&
                  route.name === 'Favorites'"
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

    <div
      v-if="isOwnFavoritesView && userStore.isLoggedIn"
      class="side_buttons"
    >
      <ScreenshotButton
        :feedWrapper="feedWrapper"
        :onToggleComments="toggleComments"
        :onToggleCommentBox="toggleCommentBox"
        :onToggleFavCount="toggleFavCount"
        :onToggleTimestamp="toggleTimestamp"
        :onToggleUser="toggleUser"
        :onRegularMode="setRegularMode"
        :onProperMode="setProperMode"
        :onRainbowMode="setRainbowMode"
        :onOldenMode="setOldenMode"
        :onToggleDecoration="toggleDecoration"
        :onToggleTony="toggleTony"
        :onToggleGutenberg="toggleGutenberg"
      />
    </div>
  </div>
</template>

<style scoped>
.center_page {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: white;
  padding: 0 10px;
}

.side_buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-self: flex-start;
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

.login_prompt,
.no_posts {
  width: 800px;
  padding: 20px;
  border-radius: 10px;
  background: var(--color-background);
  border: 2px solid var(--color-border);
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
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.login_prompt {
  display: flex;
  justify-content: center;
  align-items: center;
}

.no_posts {
  text-align: center;
  color: var(--color-muted);
}

.user_post_box {
  position: relative;
  width: 800px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 40px 15px 15px;
  margin-bottom: 20px;
  text-align: left;
}

.post_decoration {
  position: absolute;
  top: -45px;
  right: -30px;
  width: 100px;
  height: 100px;
}

.tony_decoration {
  position: absolute;
  top: 15px;
  right: -5px;
  width: 100px;
  height: 100px;
}

.gutenberg_decoration {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 100px;
  height: 100px;
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

.favorites_count {
  margin-left: 8px;
  font-size: 1rem;
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
  color: green;
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
  cursor: pointer;
}

/* proper mode */
.wrapper.proper-mode {
  font-family: 'Oswald', sans-serif;
}

.wrapper.proper-mode,
.wrapper.proper-mode * {
  color: white !important;
}

.wrapper.proper-mode .user_post_box {
  background-image: url('/path/to/your/background.jpg');
  background-size: cover;
  background-position: center;
}

.wrapper.proper-mode .user_post_box::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  z-index: 0;
}

.wrapper.proper-mode .user_post_box > *:not(.post_decoration):not(.tony_decoration):not(.gutenberg_decoration):not(.post_user) {
  position: relative;
  z-index: 1;
}

.wrapper.proper-mode .post_decoration,
.wrapper.proper-mode .tony_decoration,
.wrapper.proper-mode .gutenberg_decoration {
  position: absolute !important;
}

.wrapper.proper-mode .post_user {
  position: absolute !important;
  z-index: 1;
}

.wrapper.proper-mode .post_content::before {
  content: '“';
  font-size: 2rem;
  margin-right: 0.2em;
}
.wrapper.proper-mode .post_content::after {
  content: '”';
  font-size: 2rem;
  margin-left: 0.2em;
}

/* rainbow mode */
.wrapper.rainbow-mode .user_post_box {
  background: linear-gradient(
    135deg,
    #FFC1CC 0%,
    #FFD8A8 20%,
    #FDFD96 40%,
    #C1E1C1 60%,
    #B5EAEA 80%,
    #FFC1CC 100%
  );
}

.wrapper.rainbow-mode .post_user,
.wrapper.rainbow-mode .post_content,
.wrapper.rainbow-mode .post_info,
.wrapper.rainbow-mode .comment_user,
.wrapper.rainbow-mode .comment_item,
.wrapper.rainbow-mode .new_post_box textarea,
.wrapper.rainbow-mode .new_post_box button,
.wrapper.rainbow-mode .login_prompt p,
.wrapper.rainbow-mode .no_posts,
.wrapper.rainbow-mode .btn-comment,
.wrapper.rainbow-mode input,
.wrapper.rainbow-mode textarea {
  color: transparent !important;
  background: linear-gradient(
    135deg,
    #FFC1CC 0%,
    #FFD8A8 20%,
    #FDFD96 40%,
    #C1E1C1 60%,
    #B5EAEA 80%,
    #FFC1CC 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0.1px 1px rgb(133, 38, 127);
}

/* olden english mode */
.wrapper.olden-mode {
  background: url('/olden-bg.jpg') center/cover no-repeat;
  font-family: 'Uncial Antiqua', 'Blackletter686 BT', serif !important;
  color: #3e2c1c !important;
}
.wrapper.olden-mode .user_post_box {
  background: rgba(245, 240, 225, 0.85);
  border: 1px solid #bfa76f;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.wrapper.olden-mode .post_user {
  position: absolute;
  top: 10px;
  left: 15px;
  font-family: 'Blackletter686 BT', serif !important;
  color: #7f3700 !important;
}

.wrapper.olden-mode .post_content {
  font-style: italic;
  position: relative;
}

.wrapper.olden-mode .post_content::before {
  content: '“';
  font-size: 2rem;
  margin-right: 0.2em;
}

.wrapper.olden-mode .post_content::after {
  content: '”';
  font-size: 2rem;
  margin-left: 0.2em;
}

.wrapper.olden-mode input,
.wrapper.olden-mode textarea,
.wrapper.olden-mode .btn-comment,
.wrapper.olden-mode .login_prompt,
.wrapper.olden-mode .no_posts,
.wrapper.olden-mode .new_post_box button {
  font-family: 'Uncial Antiqua', serif !important;
  color: #3e2c1c !important;
  background: transparent;
  border-color: #bfa76f !important;
}
</style>
