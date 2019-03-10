const myVue = new Vue({
  el: '#app',
  data: {
    gameData: [],
    sepGames: [],
    octGames: [],
    isLoaded: false,
    landscape: false,
    previusShow: "sepSchedule",
    actualShow: "sepSchedule",
    show: {
      sepSchedule: true,
      octSchedule: false,
    }
  },

  methods: {

    checkOrientation() {
      window.addEventListener("orientationchange", () => this.landscape = !this.landscape);
    },

    doOnLandscape(){
      switch (true) {
        case this.actualShow.includes("Game"):
        this.show[this.gameData.find(game => game.id === this.actualShow).previus] = true;
        break;
        case this.actualShow.includes("Schedule"):
          this.show[this.gameData.find(game => game.previus === this.actualShow).id] = true;
          break;
        default:
          //Put something here
      }
    },

    showOnlyThis(keyName){
      this.show[keyName] = true;
      Object.keys(this.show).filter(key => key !== keyName).forEach(key => this.show[key] = false);
    },

    showThis(before, actual) {
      this.previusShow = before;
      this.actualShow = actual;
      this.showOnlyThis(actual)
      if (this.landscape) {
        this.doOnLandscape();
      }
    },

    async getData() {
      //await the response of the fetch call
      let response = await fetch("https://nysl-app-mobile.firebaseio.com/games.json", {
        method: "GET",
        dataType: 'json',
      });
      //proceed once the first promise is resolved.
      let data = await response.json()
      //proceed only when the second promise is resolved
      this.gameData = data;
      this.gameData.forEach(game => this.show[game.actual] = false);
      this.sepGames = data.filter(game => game.month === "september");
      this.octGames = data.filter(game => game.month === "october");
      this.isLoaded = true;
    }
  },

  watch: {
    landscape() {
      //User was on portrait
      if (this.landscape) {
        this.doOnLandscape()
        //User was on landscape
      } else {
        this.showOnlyThis(this.actualShow);
      }
    }
  },

  created() {
    this.getData();
  },
  beforeUpdate() {
    console.log("Before: " + this.previusShow);
    console.log("Now: " + this.actualShow);
  },
  mounted() {
    this.checkOrientation();
  },



})
