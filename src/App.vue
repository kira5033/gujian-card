<template>
  <div id="app">

    <!-- Navbar -->
    <div class="nav">
      <div class="nav-item left">
        古劍奇譚 - 千秋戲模擬器
      </div>
      <div class="nav-item nav-title">
        目前得分：{{ gameScore}}
      </div>
      <div class="nav-item right">
        
      </div>
    </div>

    <!-- container start -->
    <div class="content-container">
      <!-- left block start -->
      <div class="leftMenu">
        <div class="combine-main" v-for="(item,index) in cardRule" :key="index">
          <div class="combine-content">
              <div class="achievement">
                {{ item.name }}({{ item.point }})：
              </div>
              <div v-for="(card,index) in cardName(item.package)" :key="index">
                <span :class="card.isActive === true ? 'isfocus' : ''">
                  {{ card.name }} 
                </span>
                <slot v-if='cardName(item.package).length !== index + 1'>
                  , 
                </slot>
              </div>
          </div>
          
        </div>
      </div>
      <!-- left block end -->
      <!-- right block start -->
      <div class="main">
        <div class="top">
          <!-- search block start -->
          <div class="search">
            <b-input-group class="mb-2">

              <b-input-group-prepend is-text>
                <b-icon icon="search"></b-icon>
              </b-input-group-prepend>

              <b-form-input type="search" v-model="keyword" placeholder="搜尋卡牌"></b-form-input>
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
        
        <!-- card list block -->
        <div class="main-list">
          <div class="list-img" v-for="(item,index) in cardList" :key="index" @click="cardHandler(item.id)">
            <img :src="require('@/assets/image/' + item.img)" alt="">
            <div class="cover" v-if="!item.isActive"><div class="mask"></div></div>
          </div>
        </div>

        <span class="sm-note">Created and maintained by <a href="" target="_blank">Kira5033</a> @ 2020.03.11<br>This project is hosted on <a href="" target="_blank">GitHub</a>. Any bug report or suggestion is welcome.</span>
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
      season: null,
      selectedCard:[],
      selectedSeason:[ 1, 2, 3, 4 ],
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

      this.checkGameScore()
    },
    cardName(list){
      return this.baseCardList.filter((item) => {
        return list.indexOf(item.id) >= 0
      })
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
      let countScore = 0;
      this.cardRule.forEach((element, key) => {
        let activeStatus = false
        if(element.activeQty === 0){
          activeStatus = true
          countScore += element.point
        }
        this.$store.commit('updateRuleStatus', { "index": key, "status": activeStatus})
      });
      this.gameScore = countScore
    },
    playGame(){
      this.$store.dispatch('initialGame')
      this.gameScore = 0
    }
  },
  mounted(){
    this.playGame()
  }
}
</script>

<style>
@import './assets/css/base.css';
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  font-family: "Helvetica", "Arial","LiHei Pro","黑體-繁","微軟正黑體", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  display: flex;
  height: 1024px;
}


.nav {
  background-color: black;
  font-size: 18px;
  width: 100%;
  color: aliceblue;
  font-weight: bold;
  display: flex;
  justify-content:space-between;
  height: 5vh;
  line-height:  5vh;
  /* padding: 1% 0; */
  position: fixed;
  z-index: 999;
}

.nav .nav-item{
  width: 33%;
}

.nav .nav-title{
  text-align: center;
}

.nav .left {
  padding-left: 15px;
  text-align: initial;
}

.nav .right {
  text-align: right;
  padding-right: 15px;
}


.content-container {
  display: flex;
  width: 100%;
  /* padding-bottom: 100px; */
}

.search{
  width: 70%;
  margin: 0 auto;
  padding-top: 20px;
}

.leftMenu{
  width:25%;
  height: 100%;
  background-color: bisque;
  margin: 0; 
  padding: 0;
  padding-top: 5vh;
  overflow-y:auto;
}

.main{
  width: 75%;
  height: 100%;
  /* background-color: cornflowerblue; */
  background-color: #D0CBCB;
  /* background-color: #ffffff; */
  padding: 0;
  margin: 0 auto;
  padding-top: 5vh;
  overflow-y:auto;
}

.main .top{
  min-height: 100px;
  margin: 20px auto 0 auto;
}

.main .main-list{
  /* padding: 0 25px 20px 55px; */
  margin: 20px auto;
  max-width: 1220px;
  display: flex;
  flex-wrap: wrap;
}

.main .main-list .list-img{
  position: relative;
}

.main img{
  width: auto;
  height: auto;
  z-index: 1;
}

.combine-main {
  margin: 20px 10px;
}

.combine-content{
  display: flex;
  flex-wrap: wrap;
  line-height: 18px;
}

.areaCenter {
  display: flex;
}

.isfocus{
  color: red;
}

.cover{
  color: #fff;
  position: absolute;
  top: 50%;
  /* height: calc(100% - 20px); */
  height: 100%;
  /* width: calc(100% - 20px); */
  width: 100%;
  padding: 15px 0;
  text-align: center;
  font-size: 25px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
}

.mask{
  position: absolute;
  top: 50%;
  left: 50%;
  Transform:translate(-50%,-50%);
  width: fit-content;
}

.achievement {
  font-weight: 600;
}

.sm-note{
  font-size: 12px;
  padding-bottom: 20px;
}

</style>
