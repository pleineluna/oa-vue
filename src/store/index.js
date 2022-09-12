import Vue from 'vue'
import Vuex from 'vuex'
import menus from "./modules/menus";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '', //令牌
    avatar: '' //头像
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
      localStorage.setItem("token", token)
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    }

  },
  actions: {},
  modules: {
    menus
  }
})
