import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: '',
    viewingUser: '',
    isLoggedIn: false,
    mode: 'login',

    followersCount: 50,
    followingCount: 5000,
    postCount: 4
  }),

  actions: {
    toggleMode(newMode) {
      this.mode = newMode
    },

    login(userEmail) {
      this.currentUser = userEmail
      this.isLoggedIn = true
    },

    logout() {
      this.currentUser = ''
      this.isLoggedIn = false
    },

    setViewingUser(viewUsername) {
      this.viewingUser = viewUsername
    },
  },

  getters: {
    isLogin: (state) => state.mode === 'login',
    isViewingAnotherUser: (state) => state.viewingUser !== ''
  }
})