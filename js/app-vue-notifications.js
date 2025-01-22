/* global Vue, $ */

// eslint-disable-next-line no-new
new Vue({
  el: '#app-vue-notifications',

  data: {
    requestCookieConsent: false,
    showDigiSignWebinars: false,
  },

  methods: {
    grantCookieConsent() {
      this.requestCookieConsent = false;
      localStorage.setItem('cookieConsent', 'granted');
      window.location.reload(true);
    },

    openDigiSignWebinars() {
      this.showDigiSignWebinars = false;

      if (!this.requestCookieConsent) {
        localStorage.setItem('showDigiSignWebinars', 'false');
      }

      window.location.href = this.$refs.digiSignWebinarsPageLink.href;
    },

    hideDigiSignWebinars() {
      this.showDigiSignWebinars = false;

      if (!this.requestCookieConsent) {
        localStorage.setItem('showDigiSignWebinars', 'false');
      }
    },
  },

  async mounted() {
    $('.toast').toast('show');

    if (localStorage.getItem('cookieConsent') !== 'granted') {
      this.requestCookieConsent = true;
    }

    this.showDigiSignWebinars = false;
    if (localStorage.getItem('showDigiSignWebinars') === 'false') {
      this.showDigiSignWebinars = false;
    }
  },
});
