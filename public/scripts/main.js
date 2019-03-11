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
    currentUser: "",
    currentUID: "",
    db: firebase.database(),
    show: {
      sepSchedule: true,
      octSchedule: false,
    }
  },

  methods: {

    checkOrientation() {
      window.addEventListener("orientationchange", () => this.landscape = !this.landscape);
    },

    doOnLandscape() {
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

    showOnlyThis(keyName) {
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
      this.sepGames = data.filter(game => game.month === "september");
      this.octGames = data.filter(game => game.month === "october");
      this.isLoaded = true;
    },

    //Firebase Auth
    initFirebaseAuth() {
      // Listen to auth state changes.
      firebase.auth().onAuthStateChanged(user => {
        // We ignore token refresh events.
        if (user && this.currentUID === user.uid) {
          return;
        }

        if (user) { //Log IN
          this.currentUID = user.uid;
          this.currentUser = user;
          this.writeUserData(user.uid, user.displayName, user.photoURL);
        } else { //Log Out
          // Set currentUID to null.
          this.currentUID = null;
          // Display the splash page where you can sign-in.
        }
      });
    },

    getUserID(){
      return firebase.auth().currentUser.uid;
    },

    getProfilePicUrl() {
      return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
    },

    getUserName() {
      return firebase.auth().currentUser.displayName;
    },

    signIn() {
      // Sign into Firebase using popup auth & Google as the identity provider.
      firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
    },

    signOut() {
      // Sign out of Firebase.
      firebase.auth().signOut();
    },

    //Firebase Database
    sendMessage() {
      let msg = document.getElementById('message').value;
      document.getElementById('message').value = "";
      this.db.ref('message').push({
        message: msg,
        user: this.getUserName(),
        userID: this.currentUID
      });
    },

    writeUserData(userId, name, imageUrl) {
      firebase.database().ref('users/' + userId).set({
        username: name,
        profile_picture: imageUrl
      });
    },

    getMessage() {
      this.db.ref('message').on('child_added', data => {
        document.getElementById('chat').innerHTML += `<p> ${data.val().user}: ${data.val().message}</p>`;
        this.user
      });
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
    this.initFirebaseAuth();
    this.getMessage();
  },
  beforeUpdate() {
    console.log("Before: " + this.previusShow);
    console.log("Now: " + this.actualShow);
  },
  mounted() {
    this.checkOrientation();
  },

})
