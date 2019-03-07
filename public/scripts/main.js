const myVue = new Vue({
  el: '#app',
  data: {
    septemberSchedule: true,
    octoberSchedule: false,
    game1: false,
    game2: false,
    landscape: false,
    show: {
      septemberSchedule: true,
      octoberSchedule: false,
      game1: false,
      game2: false
    }
  },

  methods: {
    checkOrientation() {
      window.addEventListener("orientationchange", () => {
        Math.abs(screen.orientation.angle) === 90 ? this.landscape = true : this.landscape = false;
      });
    },
    showOnlyThis(before, after) {
      this.show[after] = true;
      Object.keys(this.show).filter(key => key !== after).forEach(key => this.show[key] = false );
      this.landscape ? this.show[before] = true : this.show[before] = this.show[before];
    }
  },

  created() {
  },
  beforeUpdate() {
    console.log(this.game1);
    console.log(window.screen.orientation.angle);
    this.checkOrientation();
  },
  mounted(){
    this.checkOrientation();
  },



})
