<script setup>
import { RouterLink, useRoute, useRouter } from "vue-router";
import TabItem from "./components/tabItem.vue";
import { tabsStore } from "./store/tabsStore";

const router = useRouter();
/* 만든 라우터 3개를 배열로 가져온다 */
const routes = router.getRoutes();
// console.log(routes[1].path);
// /* store 메소드 호출 */
const store = tabsStore();
const setTabs = (r) => {
  store.addTab(r);
};
</script>

<template>
  <div id="container">
    <!-- 사이드바 -->
    <div id="sidebar">
      <!-- 만든 라우터를 for문으로 출력 -->
      <router-link
        v-for="route in routes"
        :key="route.path"
        :to="route.path"
        @click="setTabs(route)"
        >{{ route.name }}</router-link
      >
    </div>
    <!-- 내용 -->
    <div id="contents">
      <tab-item />
      <router-view />
    </div>
  </div>
</template>
<style scoped>
#sidebar .router-link-active {
  background-color: brown;
}
</style>
