<template>
  <transition name="toast">
    <div v-if="msg" class="toast" role="status" aria-live="polite">{{ msg }}</div>
  </transition>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
const msg = ref('')
let timer = null
function onToast(e) {
  msg.value = e.detail
  clearTimeout(timer)
  timer = setTimeout(() => { msg.value = '' }, 1800)
}
onMounted(() => window.addEventListener('ps2-toast', onToast))
onBeforeUnmount(() => {
  window.removeEventListener('ps2-toast', onToast)
  clearTimeout(timer)
})
</script>
