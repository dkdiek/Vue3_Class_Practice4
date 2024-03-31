import { ref } from "vue";

const tabsList = ref([{ name: "home", path: "/" }]);

const tabsStore = {
  addTab: (tab) => {
    /* 생성된 배열에 탭이 있으면 추가 안되도록 */
    let hasTab = tabsList.value.find((v) => v.path === tab.path);
    if (!hasTab) {
      tabsList.value.push(tab);
    }
  },
  getTabs: () => {
    return tabsList.value;
  },
};

export default tabsStore;
