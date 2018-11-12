<template>
  <div class="site">
    <a href="#main">Skip to content</a>
    <main id="main">
      <nuxt/>
    </main>
  </div>
</template>

<script>
export default {
  methods: {
    handleKeyboardUser(e) {
      if (e.keyCode === 9) {
        window.removeEventListener('keyup', this.handleKeyboardUser)
        const classes = document.documentElement.classList
        classes.add('with-keyboard')
      }
    }
  },
  mounted() {
    window.addEventListener('keyup', this.handleKeyboardUser)
  }
}
</script>

<style lang="scss" scoped>
.site {
  background: $white;
  margin: 0 auto;
  max-width: 1440px;
  overflow: hidden;

  [href="#main"] {
    left: 10px;
    position: absolute;
    top: -100%;

    &:focus {
      top: 10px;
    }
  }
}
</style>
