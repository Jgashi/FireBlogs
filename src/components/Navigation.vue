<template>
  <header>
    <nav class="container">
      <div class="branding">
        <router-link class="header" :to="{ name:'Home' }">FireBlogs</router-link>
      </div>
      <div class="nav-links">
        <ul v-show="!mobile">
          <router-link class="link" :to="{ name: 'Home' }"
>Home</router-link>
          <router-link class="link" :to="{ name: 'Blogs' }"
>Blogs</router-link>
          <router-link v-if="admin" class="link" :to="{ name: 'CreatePost' }">Create Post</router-link>
          <router-link v-if="!user" class="link" :to="{ name: 'Login' }">Login/Register</router-link>
        </ul>
        <div v-show="!mobile" v-if="user" @click="toggleProfileMenu"  class="profile" ref="profile">
          <span>{{ this.$store.state.profileInitials }}</span>
          <div v-show="profileMenu" class="profile-menu">
            <span></span>
            <div class="info">
              <p class="initials">{{ this.$store.state.profileInitials }}</p>
              <div class="right">
                <p>{{ this.$store.state.profileFirstName }} {{ this.$store.state.profileLastName }}</p>
                <p>{{ this.$store.state.profileUsername }}</p>
                <p>{{ this.$store.state.profileEmail }}</p>
              </div>
            </div>
            <div class="options">
              <div class="option">
                <router-link class="option" :to="{ name:'Profile' }">
                  <userIcon class="icon" />
                  <p>profile</p>
                </router-link>
              </div>
              <div v-if="admin" class="option">
                <router-link class="option" :to="{ name:'Admin' }">
                  <adminIcon class="icon" />
                  <p>Admin</p>
                </router-link>
              </div>
              <div @click="signOut" class="option">
                <signOutIcon class="icon" />
                <p>Sign Out</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <menuIcon @click="toggleMobileNav" class="menu-icon" v-show="mobile"/>
    <transition name="mobile-nav">
      <ul class="mobile-nav" v-show="mobileNav">
        <router-link class="link" :to="{ name: 'Home' }"
>Home</router-link>
        <router-link class="link" :to="{ name: 'Blogs' }">Blogs</router-link>
        <router-link v-if="admin" class="link" :to="{ name: 'CreatePost' }">>Create Post</router-link>
        <router-link v-if="!user" class="link" :to="{ name: 'Login' }">Login/Register</router-link>
      </ul>
    </transition>
  </header>
</template>

<script>
import menuIcon from '../assets/Icons/bars-regular.svg';
import userIcon from '../assets/Icons/user-alt-light.svg';
import adminIcon from '../assets/Icons/user-crown-light.svg';
import signOutIcon from '../assets/Icons/sign-out-alt-regular.svg';
import firebase from "firebase/app";
import "firebase/auth";
export default {
  name: 'navigation',
  components: {
    menuIcon,
    userIcon,
    adminIcon,
    signOutIcon
  },
  data() {
    return {
      profileMenu: null,
      mobile: null,
      mobileNav: null,
      windowWidth: null,
    };
  },
  created() {
    window.addEventListener('resize', this.checkScreem);
    this.checkScreem();
  },
  methods: {
    signOut() {
      firebase.auth().signOut();
      window.location.reload();
    },
    checkScreem() {
      this.windowWidth = window.innerWidth;
      if (this.windowWidth <= 768) {
        this.mobile = true;
        return;
      }
      this.mobile = false;
      this.mobileNav = false;
      return;
    },
    toggleProfileMenu(e) {
      if(e.target === this.$refs.profile) {
        this.profileMenu = !this.profileMenu;
      }
    },
    toggleMobileNav() {
      this.mobileNav = !this.mobileNav;
    }
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    admin() {
      return this.$store.state.profileAdmin;
    },
  }
}
</script>

<style lang="scss" scoped>
header {
  padding: 0 25px;
  border-color: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 99;

  .link {
    font-weight: 500;
    padding: 0 8px;
    transition: .3s coloe ease;

    &:hover {
      color: #1eb8b8;
    }
  }

  nav {
    display: flex;
    padding: 25px 0;
    
    .branding {
      display: flex;
      align-items: center;

      .header {
        font-weight: 600;
        font-size: 24px;
        color: #000;
        text-decoration: none;
      }
    }

    .nav-links {
      display: flex;
      justify-content: flex-end;
      position: relative;
      flex: 1;
      align-items: center;

      ul {
        margin-right: 32px;

        .link {
          margin-right: 32px;
        }

        .link:last-child {
          margin-right: 0;
        }
      }

      .profile {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        color: #fff;
        background-color: #303030;
        cursor: pointer;

        span {
          pointer-events: none;
        }

        .profile-menu {
          position: absolute;
          top: 65px;
          right: 0;
          width: 250px;
          background-color: #303030;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

          span {
            position: absolute;
            right: 10px;
            top: -10px;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid #303030;
          }

          .info {
            display: flex;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #fff;

            .initials {
              position: initial;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 40px;
              height: 40px;
              color: #303030;
              background-color: #fff;
              border-radius: 50%;
            }

            .right {
              flex: 1;
              margin-left: 24px;

              p:nth-child(1) {
                font-size: 14px;
              }

              p:nth-child(2), 
              p:nth-child(3) {
                font-size: 12px;
              }
            }
          }

          .options {
            padding: 15px;
            .option {
              text-decoration: none;
              color: #fff;
              display: flex;
              align-items: center;
              margin-bottom: 12px;

              .icon {
                width: 18px;
                height: auto;
              }

              p {
                font-size: 14px;
                margin-left: 12px;
              }

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
    }
  }

  .menu-icon {
    width: auto;
    position: absolute;
    top: 32px;
    right: 25px;
    height: 25px;
    cursor: pointer;
  }

  .mobile-nav {
    width: 70%;
    max-width: 250px;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    padding: 20px;
    background-color: #303030;

    .link {
      padding: 15px 0;
      color: #fff;
    }
  }

  .mobile-nav-enter-active,
  .mobile-nav-leave-active {
    transition: all .8s ease-in-out;
  }

  .mobile-nav-enter {
    transform: translateX(-250px);
  }

  .mobile-nav-enter-to {
    transform: translateX(0px);
  }

  .mobile-nav-leave-to {
    transform: translateX(-250px);
  }
}
</style>