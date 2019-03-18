const myVue = new Vue({
  el: '#app',
  data: {
    gameData: [],
    sepGames: [],
    octGames: [],
    isLoaded: false,
    landscape: false,
    messageText: "",
    previusShow: "sepSchedule",
    actualShow: "sepSchedule",
    currentUser: null,
    currentUID: "",
    currentUimg: "",
    currentUserName: "",
    db: firebase.database(),
    show: {
      sepSchedule: true,
    }
  },

  methods: {

    checkOrientation() {
      window.addEventListener("orientationchange", () => this.landscape = !this.landscape);
    },

    showLoginPage() {
      return this.actualShow.includes("chat") && this.currentUser == null;
    },

    doOnLandscape() {
      if (this.actualShow.includes("Game")) {
        this.show[this.gameData.find(game => game.id === this.actualShow).previus] = true;
      } else if (this.actualShow.includes("Schedule")) {
        this.show[this.gameData.find(game => game.previus === this.actualShow).id] = true;
      }
    },

    showOnlyThis(keyName) {
      this.show[keyName] = true;
      Object.keys(this.show).filter(key => key !== keyName).forEach(key => this.show[key] = false);
    },

    showThis(actual) {
      this.actualShow = actual;
      this.showOnlyThis(actual);
      this.$forceUpdate();
      this.landscape ? this.doOnLandscape() : 0;
      this.messageText = "";
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
      this.gameData.forEach(game => this.getMessage(game.msgChat, game.chat));
      this.isLoaded = true;
    },

    scrollBottom(chatID) {
      const chat = document.getElementById(chatID);
      chat.scrollTop = chat.scrollHeight - chat.clientHeight;
    },

    /*
    *
    * FIREBASE AUTH
    *
    */
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
          this.currentUimg = user.photoURL || 'https://wowsciencecamp.org/wp-content/uploads/2018/07/dummy-user-img-1.png';
          this.currentUserName = user.displayName;
          this.writeUserData(user.uid, user.displayName, user.photoURL);
        } else { //Log Out
          this.currentUID = this.currentUser = null;
        }
      });
    },

    signIn() {
      // Sign into Firebase using popup auth & Google as the identity provider.
      firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
      // this.gameData.forEach(game => this.scrollBottom(game.chat));
    },

    signOut() {
      // Sign out of Firebase.
      firebase.auth().signOut();
    },

    /*
    *
    * FIREBASE DATABASE
    *
    */

    sendMessage(msgID) {
      this.db.ref(msgID).push({
        message: this.messageText,
        user: this.currentUser.displayName,
        userID: this.currentUID
      });
      this.messageText = "";
    },

    writeUserData(userId, name, imageUrl) {
      firebase.database().ref('users/' + userId).set({
        username: name,
        profile_picture: imageUrl
      });
    },

    chatTemplate(chatID, data, position, firstClass, secondClass) {
      document.getElementById(chatID).innerHTML +=
        `<div class="d-flex justify-content-${position}">
        <div class="talk-bubble tri-right ${firstClass} round">
          <div class="${secondClass}">
            <p class="pChat name">${data.val().user}</p>
            <p class="pChat">${(data.val().message).replace(/\s\s+/g, ' ')}</p>
          </div>
        </div>
        </div>`;
    },

    getMessage(msgID, chatID) {
      this.db.ref(msgID).on('child_added', data => {
        data.val().userID == this.currentUID
          ? this.chatTemplate(chatID, data, "end", "rightTop", "talktextRight")
          : this.chatTemplate(chatID, data, "start", "left-top", "talktextLeft")
        this.scrollBottom(chatID)
      });
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
    console.log(this.show);
  },
  mounted() {
    this.checkOrientation();
  },

})
