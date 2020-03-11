import Vue from "vue"
import Vuex from "vuex"
import axios from "axios"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    cardRule: [],
    cardList: [],
    seasonType: [],
  },
  getters: {
    getCardRule(state) {
      return state.cardRule.sort((a, b) => {
        if (a.activeQty === b.activeQty) {
          return a.id - b.id
        } else {
          return a.activeQty - b.activeQty
        }
      })
    },
    getCardList(state) {
      return state.cardList
    },
    getSeasonType(state) {
      return state.seasonType
    },
  },
  mutations: {
    setDefault(state, data) {
      state.cardRule = data.rules
      state.cardList = data.card
      state.seasonType = data.season
    },
    setCardRule(state, data) {
      state.cardRule = data
    },
    setCardList(state, data) {
      state.cardList = data
    },
    updateCardStatus(state, {id, status}) {
      state.cardList[id - 1].isActive = status
    },
    updateRuleActiveQty(state, {index, qty}) {
      state.cardRule[index].activeQty += qty
    },
    updateRuleStatus(state, {index, status}) {
      state.cardRule[index].isActive = status
    },
  },
  actions: {
    initialGame(context) {
      return axios.get("./default.json").then((res) => {
        context.commit("setDefault", res.data)
      })
    },
  },
  modules: {},
})
