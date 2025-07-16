import { defineStore } from 'pinia'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { getApp } from 'firebase/app'

const app = getApp()
const db = getFirestore(app)

const postsCollection   = collection(db, 'posts')
const followsCollection = collection(db, 'follows')
const usersCollection   = collection(db, 'users')

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: '',
    viewingUser: '',
    isLoggedIn: false,
    mode: 'login',

    postCount: 0,
    followersCount: 0,
    followingCount: 0,

    viewingPostCount: 0,
    viewingFollowersCount: 0,
    viewingFollowingCount: 0,

    isFollowingViewingUser: false
  }),

  actions: {
    toggleMode(newMode) {
      this.mode = newMode
    },

    async login(userEmail) {
      if (!userEmail) return

      const userQ   = query(usersCollection, where('email', '==', userEmail))
      const userSnap = await getDocs(userQ)

      if (userSnap.empty) {
        await addDoc(usersCollection, {
          email: userEmail,
          feed: [],
          followers: [],
          following: [],
          posts: []
        })
      }

      this.currentUser = userEmail
      this.isLoggedIn  = true

      await Promise.all([
        this.fetchMyPostCount(),
        this.fetchMyFollowersCount(),
        this.fetchMyFollowingCount()
      ])
    },

    logout() {
      this.currentUser = ''
      this.isLoggedIn = false
      this.postCount = 0
      this.followersCount = 0
      this.followingCount = 0
    },

    async setViewingUser(viewUsername) {
      this.viewingUser = viewUsername
      await Promise.all([
        this.fetchViewingPostCount(),
        this.fetchViewingFollowersCount(),
        this.fetchViewingFollowingCount(),
        this.fetchFollowingStatus()
      ])
    },

    async fetchMyPostCount() {
      if (!this.currentUser) return
      const q = query(postsCollection, where('user', '==', this.currentUser))
      const snap = await getDocs(q)
      this.postCount = snap.size
    },

    async fetchViewingPostCount() {
      if (!this.viewingUser) return
      const q = query(postsCollection, where('user', '==', this.viewingUser))
      const snap = await getDocs(q)
      this.viewingPostCount = snap.size
    },

    async fetchMyFollowersCount() {
      if (!this.currentUser) return
      const q = query(followsCollection, where('followed', '==', this.currentUser))
      const snap = await getDocs(q)
      this.followersCount = snap.size
    },

    async fetchViewingFollowersCount() {
      if (!this.viewingUser) return
      const q = query(followsCollection, where('followed', '==', this.viewingUser))
      const snap = await getDocs(q)
      this.viewingFollowersCount = snap.size
    },

    async fetchMyFollowingCount() {
      if (!this.currentUser) return
      const q = query(followsCollection, where('follower', '==', this.currentUser))
      const snap = await getDocs(q)
      this.followingCount = snap.size
    },

    async fetchViewingFollowingCount() {
      if (!this.viewingUser) return
      const q = query(followsCollection, where('follower', '==', this.viewingUser))
      const snap = await getDocs(q)
      this.viewingFollowingCount = snap.size
    },

    async fetchFollowingStatus() {
      if (!this.currentUser || !this.viewingUser) {
        this.isFollowingViewingUser = false
        return
      }
      const q = query(
        followsCollection,
        where('follower', '==', this.currentUser),
        where('followed', '==', this.viewingUser)
      )
      const snap = await getDocs(q)
      this.isFollowingViewingUser = snap.size > 0
    },

    async followUser() {
      if (!this.currentUser || !this.viewingUser) return
      await addDoc(followsCollection, {
        follower: this.currentUser,
        followed: this.viewingUser
      })
      this.followingCount++
      this.viewingFollowersCount++
      this.isFollowingViewingUser = true
    },

    async unfollowUser() {
      if (!this.currentUser || !this.viewingUser) return

      const q    = query(
        followsCollection,
        where('follower', '==', this.currentUser),
        where('followed', '==', this.viewingUser)
      )
      const snap = await getDocs(q)
      const deletes = snap.docs.map(d =>
        deleteDoc(doc(db, 'follows', d.id))
      )
      await Promise.all(deletes)

      this.followingCount--
      this.viewingFollowersCount--
      this.isFollowingViewingUser = false
    },


    async fetchMyFollowingList() {
      if (!this.currentUser) return []
      const q = query(followsCollection, where('follower', '==', this.currentUser))
      const snap = await getDocs(q)
      return snap.docs.map(d => d.data().followed)
    },

    async followUserByEmail(email) {
      if (!this.currentUser) return
      await addDoc(followsCollection, {
        follower: this.currentUser,
        followed: email
      })
      this.followingCount++
    },

    async unfollowUserByEmail(email) {
      if (!this.currentUser) return
      const q = query(
        followsCollection,
        where('follower', '==', this.currentUser),
        where('followed', '==', email)
      )
      const snap = await getDocs(q)
      const deletes = snap.docs.map(d =>
        deleteDoc(doc(db, 'follows', d.id))
      )
      await Promise.all(deletes)
      this.followingCount--
    }
  },

  getters: {
    isLogin: s => s.mode === 'login',
    isViewingAnother: s => !!s.viewingUser
  }
})