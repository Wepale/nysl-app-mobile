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
    }
  },

  methods: {

    checkOrientation() {
      window.addEventListener("orientationchange", () => this.landscape = !this.landscape);
    },


    doOnLandscape() {

      if (this.actualShow.includes("Game")) {
        this.show[this.gameData.find(game => game.id === this.actualShow).previus] = true;
      } else if (this.actualShow.includes("Schedule")) {
        this.show[this.gameData.find(game => game.previus === this.actualShow).id] = true;
      }
      // switch (true) {
      //   case this.actualShow.includes("Game"):
      //     this.show[this.gameData.find(game => game.id === this.actualShow).previus] = true;
      //     break;
      //   case this.actualShow.includes("Schedule"):
      //     this.show[this.gameData.find(game => game.previus === this.actualShow).id] = true;
      //     break;
      //   default:
      //     //Includes "chat"
      // }
    },

    showOnlyThis(keyName) {
      this.show[keyName] = true;
      Object.keys(this.show).filter(key => key !== keyName).forEach(key => this.show[key] = false);
    },

    showThis(before, actual) {
      this.previusShow = before;
      this.actualShow = actual;
      this.showOnlyThis(actual);
      this.$forceUpdate();
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
      this.gameData.map(game => this.getMessage(game.msgChat, game.chat));
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

    getUserID() {
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

    sendMessage(msgID) {
      console.log(msgID);
      console.log(document.getElementById(msgID));
      let msg = document.getElementById(msgID).value;
      this.db.ref(msgID).push({
        message: msg,
        user: this.getUserName(),
        userID: this.currentUID
      });
      document.getElementById(msgID).value = "";
    },

    writeUserData(userId, name, imageUrl) {
      firebase.database().ref('users/' + userId).set({
        username: name,
        profile_picture: imageUrl
      });
    },

    getMessage(msgID, chatID) {
      this.db.ref(msgID).on('child_added', data => {
        if (data.val().userID == this.currentUID) {
          document.getElementById(chatID).innerHTML +=
            `<div class="d-flex justify-content-end">
            <div class="talk-bubble tri-right round right-top">
              <div class="talktextRight">
                <p class="pChat name">${data.val().user}</p>
                <p class="pChat">${data.val().message}</p>
              </div>
            </div>
            </div>`;
          this.scrollBottom(chatID)
        } else {
          document.getElementById(chatID).innerHTML +=
            `<div class="d-flex justify-content-start">
        <div class="talk-bubble tri-right left-top round">
          <div class="talktextLeft">
            <p class="pChat name">${data.val().user}</p>
            <p class="pChat">${data.val().message}</p>
          </div>
        </div>
        </div>`;
          this.scrollBottom(chatID)
        }
      });
    },

    scrollBottom(chatID) {
      const chat = document.getElementById(chatID);
      chat.scrollTop = chat.scrollHeight - chat.clientHeight;
    },
  },

  watch: {
    landscape() {
      this.landscape ? this.doOnLandscape() : this.showOnlyThis(this.actualShow);
    }
  },

  created() {
    this.getData();
    this.initFirebaseAuth();
  },
  beforeUpdate() {
    console.log("Before: " + this.previusShow);
    console.log("Now: " + this.actualShow);
  },
  mounted() {
    this.checkOrientation();
  },

})
