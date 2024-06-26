import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const tabsStore = defineStore("tabsStore", () => {
  const tabsList = ref([{ name: "home", path: "/" }]);
  const getTabs = computed(() => tabsList);

  const addTab = (tab) => {
    /* 생성된 배열에 탭이 있으면 추가 안되도록 */
    let hasTab = tabsList.value.find((v) => v.path === tab.path);
    if (!hasTab) {
      tabsList.value.push(tab);
    }
  };

  return { tabsList, getTabs, addTab };
});
