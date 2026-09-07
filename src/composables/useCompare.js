import { ref, computed } from 'vue'
import { phones } from './useFilters.js'

export const compareList = ref([])

export function toggleCompareSelection(id) {
  const idx = compareList.value.indexOf(id)
  if (idx >= 0) {
    compareList.value.splice(idx, 1)
  } else {
    if (compareList.value.length >= 4) {
      showCompareToast('最多只能对比 4 款机型哦')
      return
    }
    compareList.value.push(id)
  }
}

function showCompareToast(msg) {
  const existing = document.querySelector('.compare-toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.className = 'compare-toast'
  toast.textContent = msg
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2500)
}

export function clearCompareSelection() {
  compareList.value = []
}

export const canCompare = computed(() => compareList.value.length >= 2)

export const comparePhones = computed(() => {
  return phones.value.filter(p => compareList.value.includes(p.id))
})
