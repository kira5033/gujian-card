<template>
  <div id="app">

    <!-- Navbar -->
    <div class="nav">
      <div class="nav-item left">
        古劍奇譚 - 千秋戲模擬器
      </div>
      <div class="nav-item nav-title">
        分數：{{ gameScore }}
      </div>
      <div class="nav-item right">
        
      </div>
    </div>

    <!-- container start -->
    <div class="content-container">
      <!-- left block start -->
      <div class="leftMenu mobile-left">
        <!-- Only use one way to sort for now -->
        <div class="sort" v-if="false">
          <b-form-radio-group id="radio-group-2" v-model="sortType" name="radio-sub-component">
            <b-form-radio value=1>達成率優先</b-form-radio>
            <b-form-radio value=2>選取卡牌優先</b-form-radio>
          </b-form-radio-group>
        </div>
        <div class="combine-main">
          <div class="combine-content" v-for="(item,index) in cardRule" :key="index">
            <div class="achievement">
              {{ item.name }}
              <b-badge variant="light">{{ item.point }}</b-badge>：
            </div>
            <div v-for="(card,index) in findCard(item.package)" :key="index">
              <h5>
                <b-badge pill class="short-name" variant="danger" @click="setSearchHandler(card.name)" v-if="card.isActive === true">{{ card.name }}</b-badge>
                <b-badge pill class="short-name" variant="secondary" @click="setSearchHandler(card.name)" v-else>{{ card.name }}</b-badge>
              </h5>
            </div>
          </div>
        </div>
        
      </div>
      <!-- left block end -->
      <!-- right block start -->
      <div class="main mobile-main">
        <div class="top">
          <!-- search block start -->
          <div class="search">
            <b-input-group class="mb-2">

              <b-input-group-prepend is-text>
                <b-icon icon="search"></b-icon>
              </b-input-group-prepend>

              <b-form-input type="search" v-model.trim="keyword" placeholder="搜尋卡牌"></b-form-input>
              <b-input-group-append>
                <b-button variant="info" @click="playGame()">開新局</b-button>
              </b-input-group-append>
            </b-input-group>
            
            <div class="areaCenter">
              <span>卡牌分類：</span>
              <b-form-group>
                <b-form-checkbox-group
                  v-model="selectedSeason"
                  :options="cardSeasonType"
                  name="flavour-1a"
                ></b-form-checkbox-group>
              </b-form-group>
            </div>
          </div>
          <!-- search block end -->
        </div>

        <div class="auto-recommand" v-if="autoRecommandCard.length > 0">
          出牌推薦：
          <span v-for="(item, index) in autoRecommandCard" :key="index" >
            <span :class="displaySeason(item.type)" @click="cardHandler(item.id)">
              {{ item.name }}
            </span>
            <template v-if="autoRecommandCard.length - 1 !== index">
              >
            </template>
          </span>
        </div>
        
        <!-- card list block -->
        <div class="main-list">
          
          <template v-if="imgStatus === true">
            <div class="list-img" v-for="(item,index) in cardList" :key="index" @click="cardHandler(item.id)">
              <img :src="require('@/assets/image/' + item.img)" :alt="item.name" loading='lazy'>
              <div class="cover" v-if="!item.isActive"><div class="mask"></div></div>
            </div>
          </template>
          <template v-else>
            Loading...
          </template>
        </div>

        <span class="sm-note">Created and maintained by <a href="" target="_blank">Kira5033</a> @ 2020.03.15<br>This project is hosted on <a href="" target="_blank">GitHub</a>. Any bug report or suggestion is welcome.</span>
      </div>
      <!-- right block end -->
    </div>
    <!-- container end -->
    
  </div>
</template>

<script>

export default {
  name: 'App',
  data(){
    return {
      keyword: '',
      gameScore: 0,
      selectedCard:[],
      selectedSeason:[ 1, 2, 3, 4 ],
      imgStatus: true,
      autoRecommandCard: [],
    }
  },
  computed:{
    cardList(){
      return this.$store.getters['getCardList'].filter((item) => {
        return item.name.indexOf(this.keyword) >= 0 && this.selectedSeason.indexOf(item.type) >= 0
      })
    },
    cardRule(){
      return this.$store.getters['getCardRule']
    },
    baseCardList(){
      return this.$store.getters['getCardList']
    },
    cardSeasonType(){
      return this.$store.getters['getSeasonType']
    },
    sortType:{
      get(){
        return this.$store.getters['getSortType']
      },
      set(val){
        this.$store.commit('updateSortType', parseInt(val))
      }
    }
  },
  methods:{
    cardHandler(id){
      let { cardStatus, activeQty} = this.parseData(id)
      // Update card active status
      this.$store.commit('updateCardStatus', { "id": id, "status": cardStatus})

      this.cardRule.forEach((element, key) => {
        let index = element.package.findIndex((_id) => {
          return _id === id
        })
        // Find card and update qty
        if(index !== -1){
          this.$store.commit('updateRuleActiveQty', { "index": key, "qty": activeQty})
        }
      });
      // calc score
      this.checkGameScore()
      // calc card priority
      this.calcCardPrrority()
    },
    displaySeason(val){

      let color = ''

      switch (val) {
        case 1:
          color = 'season-spring'
          break;
        case 2:
          color = 'season-summer'
          break
        case 3:
          color = 'season-fall'
          break
        case 4:
          color = 'season-winter'
      }

      return color
    },
    findCard(list){
      return this.baseCardList.filter((item) => {
        return list.indexOf(item.id) >= 0
      })
    },
    setSearchHandler(name){
      this.keyword = name
    },
    parseData(id){
      let index = this.selectedCard.findIndex((_id) => {
        return _id === id
      })
      let cardStatus = null
      let activeQty = 0

      if(index !== -1){
        this.selectedCard.splice(index,1)
        cardStatus = false
        activeQty = 1
      }else{
        this.selectedCard.push(id)
        cardStatus = true
        activeQty = -1
      }

      this.selectedCard.sort((a,b) => {
        return a - b
      })

      return {
        cardStatus: cardStatus,
        activeQty:  activeQty,
      }
    },
    checkGameScore(){
      // let countScore = this.selectedCard.length * 2;
      let countScore = 0;
      this.cardRule.forEach((element, key) => {
        let activeStatus = false
        let priority = 1
        if(element.activeQty === element.package.length){
          priority = 0
        }
        if(element.activeQty === 0){
          activeStatus = true
          countScore += element.point
        }
        this.$store.commit('updateRuleStatus', { "index": key, "priority": priority, "status": activeStatus})
      });
      this.gameScore = countScore
    },
    calcCardPrrority(){

      this.autoRecommandCard = []

      this.baseCardList.forEach((element) => {
        this.autoRecommandCard.push({
          "id": element.id,
          "name": element.name,
          "priority": 0,
          "isActive": element.isActive,
          "type": element.type
        })
      })

      this.cardRule.forEach((element) => {

        if(element.priority === 1 && element.package.length !== element.activeQty){

          let avgPriority = 1

          if(element.activeQty === 1){
            // avgPriority = Math.floor(element.point / element.activeQty)
            avgPriority = element.point
          }

          this.findCard(element.package).forEach((item) => {
            if(item.isActive === false){
              // console.log(`${this.autoRecommandCard[item.id-1].name} + 1`);
              this.autoRecommandCard[item.id-1].priority += avgPriority
            }
          })
        }
      })

      // filter autoRecommandCard

      this.autoRecommandCard = this.autoRecommandCard.filter((element) => {
        return element.priority > 0 && element.isActive === false
      })

      this.autoRecommandCard = this.autoRecommandCard.sort((a,b) => {
        return b.priority - a.priority
      })

      let arrayLength = 10
      let sliceLength = 9

      if(window.screen.width <= 400){
        arrayLength = 5
        sliceLength = 4
      }

      if(this.autoRecommandCard.length > arrayLength){
        this.autoRecommandCard = this.autoRecommandCard.slice(0, sliceLength)
      }

    },
    playGame(){
      this.$store.dispatch('initialGame')
      this.gameScore = 0
      this.autoRecommandCard = []
    }
  },
  mounted(){
    this.playGame()
  }
}
</script>

<style>
@import './assets/css/base.css';
@import './assets/css/main.css';
</style>
