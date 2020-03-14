import Vue from "vue"
import Vuex from "vuex"
import axios from "axios"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    cardRule: [],
    cardList: [],
    seasonType: [],
    sortType: 2,
  },
  getters: {
    getCardRule(state) {
      return state.cardRule.sort((a, b) => {
        if (state.sortType === 1) {
          //達成率優先
          // console.log("達成率優先")
          if (a.activeQty === b.activeQty) {
            return a.id - b.id
          } else {
            return a.activeQty - b.activeQty
          }
        } else {
          //選取卡牌優先
          // console.log("選取卡牌優先")
          if (a.priority === b.priority) {
            if (a.activeQty === b.activeQty) {
              if (a.point === b.point) {
                return a.id - b.id
              } else {
                return b.point - a.point
              }
            } else {
              return a.activeQty - b.activeQty
            }
          } else {
            return b.priority - a.priority
          }
        }
      })
    },
    getCardList(state) {
      return state.cardList
    },
    getSeasonType(state) {
      return state.seasonType
    },
    getSortType(state) {
      return state.sortType
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
    updateRuleStatus(state, {index, priority, status}) {
      state.cardRule[index].priority = priority
      state.cardRule[index].isActive = status
    },
    updateSortType(state, data) {
      state.sortType = data
    },
    updateCardPriority(state, key) {
      state.cardList[key].priority += 1
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
