/* global Vue, axios, parseSubject, knownExtKeyUsages */

// eslint-disable-next-line no-new
new Vue({
  el: '#app-vue-menu',

  data: {
    user: null,
    organization: null,
    authorities: [],

    canEditOrganizationSettings: false,
  },

  methods: {
    login() {
      const urlSearchParams = new URLSearchParams({ returnUrl: window.location });
      window.location.href = `${this.$refs.authPageLink.href}?${urlSearchParams.toString()}`;
    },

    async logout() {
      try {
        await axios.post('https://sigex.kz/api/auth', { logout: true });
      } catch { /* ignore */ }

      window.location.href = this.$refs.homePageLink.href;
    },
  },

  async mounted() {
    try {
      const response = await axios.get('https://sigex.kz/api/auth');

      if (response.data.message) {
        return;
      }

      const subject = parseSubject(response.data.subjectStructure);
      this.user = subject.CN;
      this.organization = subject.O;

      this.authorities = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const extKeyUsage of response.data.extKeyUsages) {
        const extKeyUsageName = knownExtKeyUsages.get(extKeyUsage);
        if (extKeyUsageName) {
          this.authorities.push(extKeyUsageName);
        }
      }
    } catch { /* ignore */ }

    try {
      const response = await axios.get('https://sigex.kz/api/organizationPermissions');

      if (response.data.message) {
        return;
      }

      this.canEditOrganizationSettings = response.data.organizationSettings;
    } catch { /* ignore */ }
  },
});
