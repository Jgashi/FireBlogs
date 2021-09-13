import Vue from 'vue';
import Vuex from 'vuex';
import firebase from "firebase/app";
import "firebase/auth";
import db from "../firebase/firebaseInit";
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    blogPosts: [],
    postLoaded: null,
    blogHTML: "write your blog title here...",
    blogTitle: "",
    blogPhotoName: "",
    blogPhotoFileURL: null,
    blogPhotoPreview: null,
    editPost: null,
    user: null,
    profileAdmin: null,
    profileEmail: null,
    profileFirstName: null,
    profileLastName: null,
    profileUsername: null,
    profileId: null,
    profileInitials: null
  },
  //You can think of them as computed properties for stores
  getters: {
    //Posts in homepage
    blogPostsFeed(state) {
      return state.blogPosts.slice(0, 2);
    },
    //Cards post at the bottom of homepage
    blogPostsCards(state) {
      return state.blogPosts.slice(2, 6);
    },
  },
  mutations: {
    //Change blogHTML(content) in create|edit post
    newBlogPost(state, payload) {
      state.blogHTML = payload;
    },
    //Change blogTitle in create|edit post
    updateBlogTitle(state, payload) {
      state.blogTitle = payload;
    },
    //Change firstName in create|edit post
    fileNameChange(state, payload) {
      state.blogPhotoName = payload;
    },
    //Change cover picture URL in create|edit post
    createFileURL(state, payload) {
      state.blogPhotoFileURL = payload;
    },
    //The X button click state contrall on cover picture preview
    openPhotoPreview(state) {
      state.blogPhotoPreview = !state.blogPhotoPreview;
    },
    //Edit button in Blogs
    toggleEditPost(state, payload) {
      state.editPost = payload;
    },
    //Restore states in edit post
    setBlogState(state, payload) {
      state.blogTitle = payload.blogTitle;
      state.blogHTML = payload.blogHTML;
      state.blogPhotoFileURL = payload.blogCoverPhoto;
      state.blogPhotoName = payload.blogCoverPhotoName;
    },
    //Reorganize after edit|delete post
    filterBlogPost(state, payload) {
      state.blogPosts = state.blogPosts.filter((post) => post.blogID !== payload);
    },
    //Update User after sign in|out
    updateUser(state, payload) {
      state.user = payload;
    },
    //State whether user is Admin
    setProfileAdmin(state, payload) {
      state.profileAdmin = payload;
    },
    //get user information in database
    setProfileInfo(state, doc) {
      state.profileId = doc.id;
      state.profileEmail = doc.data().email;
      state.profileFirstName = doc.data().firstName;
      state.profileLastName = doc.data().lastName;
      state.profileUsername = doc.data().username;
    },
    //initials in profile-menu
    setProfileInitials(state) {
      state.profileInitials =
        state.profileFirstName.match(/(\b\S)?/g).join("") +
        state.profileLastName.match(/(\b\S)?/g).join("");
    },
    changeFirstName(state, payload) {
      state.profileFirstName = payload
    },
    changeLastName(state, payload) {
      state.profileLastName = payload
    },
    changeUsername(state, payload) {
      state.profileUsername = payload
    },
  },
  actions: {
    //If user just login, use currentUser.uid to get data from firebase, update info|admin state
    //Destructuring context to { commit } (參數解構)
    async getCurrentUser({ commit }, user) {
      //Add a new document to this collection with the specified data
      const dataBase = await db.collection("users").doc(firebase.auth().currentUser.uid);
      const dbResults = await dataBase.get();
      commit("setProfileInfo", dbResults);
      commit("setProfileInitials");
      const token = await user.getIdTokenResult();
      const admin = await token.claims.admin;
      commit("setProfileAdmin", admin);
    },
    //If profile update, update users firstName|lastName|userName to firebase
    async updateUserSettings({ commit, state }) {
      const dataBase = await db.collection('users').doc(state.profileId);
      await dataBase.update({
        firstName: state.profileFirstName,
        lastName: state.profileLastName,
        username: state.profileUsername
      });
      commit("setProfileInitials");
    },
    //get blogPosts from fireBlog to list all posts from users
    async getPost({ state }) {
      const database = db.collection('blogPosts').orderBy("date", "desc");
      const dbResults = await database.get();
      dbResults.forEach((doc) => {
        //Determines whether the specified callback function returns true for any element of an array.
        if (!state.blogPosts.some((post) => post.blogID === doc.id)) {
          const data = {
            blogID: doc.data().blogID,
            blogHTML: doc.data().blogHTML,
            blogCoverPhoto: doc.data().blogCoverPhoto,
            blogTitle: doc.data().blogTitle,
            blogDate: doc.data().date,
            blogCoverPhotoName: doc.data().blogCoverPhotoName,
          };
          state.blogPosts.push(data);
        }
      });
      state.postLoaded = true;
    },
    //After edmit post, reorganize the list in Blog and get blogPosts
    async updatePost({ commit, dispatch }, payload) {
      commit("filterBlogPost", payload);
      await dispatch("getPost");
    },
    //Delete post data from fireBase
    async deletePost({ commit }, payload) {
      const getPost = await db.collection("blogPosts").doc(payload);
      await getPost.delete();
      commit("filterBlogPost", payload);
    }
  },
  modules: {
  }
})
