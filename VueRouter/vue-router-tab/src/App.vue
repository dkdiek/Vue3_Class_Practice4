<script setup>
import { RouterLink, useRoute, useRouter } from "vue-router";

const router = useRouter();
/* 만든 라우터 3개를 배열로 가져온다 */
const routes = router.getRoutes();
</script>

<template>
  <div id="container">
    <!-- 사이드바 -->
    <div id="sidebar">
      <!-- 만든 라우터를 for문으로 출력 -->
      <router-link v-for="route in routes" :key="route.path" :to="route.path">{{
        route.name
      }}</router-link>
    </div>
    <!-- 내용 -->
    <div id="contents">
      <router-view />
    </div>
  </div>
</template>

<
