<template>
  <div class="home">
    <HelloWorld msg="Hello World!"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src

@Options({
  components: {
    HelloWorld
  }
})
export default class HomeView extends Vue {}
</script>

<style scoped>
/* Add this to HomeView.vue */
.home {
  margin-top: 8rem;
  text-align: center;
}
</style>
