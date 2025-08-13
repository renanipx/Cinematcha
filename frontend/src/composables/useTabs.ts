import { ref, watch } from 'vue'

export function useTabs() {
  const activeTab = ref('search')
  const trendingPeriod = ref('day')

  function setActiveTab(tab: string) {
    activeTab.value = tab
  }

  function setTrendingPeriod(period: string) {
    trendingPeriod.value = period
  }

  return {
    activeTab,
    trendingPeriod,
    setActiveTab,
    setTrendingPeriod
  }
}