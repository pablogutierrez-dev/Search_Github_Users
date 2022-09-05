const API = "https://api.github.com/users/";

const requestMaxTimeMs = 3000;

const app = Vue.createApp({
  data() {
    return {
      search: null,
      result: null,
      error: null,
      favorites: new Map()
    };
  },
  created() {
    const savedFavorites = JSON.parse(window.localStorage.getItem("favorites"))

    if (savedFavorites?.length) {
      const favorites = new Map(savedFavorites.map(favorite => [favorite.login, favorite]))
      this.favorites = favorites;
    }
  },
  computed: {
    isFavorite() {
      return this.favorites.has(this.result.login)
    },

    allFavorites() {
      return Array.from(this.favorites.values())
    }
  },
  methods: {
    async doSearch() {
      this.result = this.error = null

      const foundInFavorites = this.favorites.get(this.search)

      const shouldRequestAgain = (() => {
        if (!!foundInFavorites) {
          const { lastRequestTime } = foundInFavorites
          const now = Date.now()
          return (now - lastRequestTime) > requestMaxTimeMs
        }
        return false
      })()

      if (!!foundInFavorites && !shouldRequestAgain) {
        return this.result = foundInFavorites
      }

      try {
        const response = await fetch(API + this.search)
        if (!response.ok) throw new Error("User Not Found")
        const data = await response.json()
        console.log(data)
        this.result = data
        foundInFavorites.lastRequestTime = Date.now()
      } catch (error) {
        this.error = error
      } finally {
        this.search = null
      }
    },

    addFavorite() {
      this.result.lastRequestTime = Date.now()
      this.favorites.set(this.result.login, this.result)
      this.updateStorage()
    },

    removeFavorite() {
      this.favorites.delete(this.result.login)
      this.updateStorage()
    },

    showFavorite(favorite) {
      this.result = favorite
    },

    checkFavorite(id) {
      return this.result - login === id
    },

    updateStorage() {
      window.localStorage.setItem('favorites', JSON.stringify(this.allFavorites))
    }
  }
});
