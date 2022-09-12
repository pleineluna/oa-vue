<template>
  <div> <img :src="index_bg"
         width="100%"
         height="100%" />
  </div>
</template>

<script>
export default {
  name: "Index",
  data () {
    return {
      index_bg: require('@/assets/ccc2.jpg'),
    }
  }
}
</script>

<style scoped>
</style>