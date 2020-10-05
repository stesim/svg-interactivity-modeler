<template>
  <div class="panel" :class="{collapsible, collapsed}">
    <div class="title-bar">
      <span v-if="collapsible" class="collapse-button" @click="collapsed = !collapsed">
        {{collapsed ? '❯' : '▼'}}
      </span>
      {{title}}
      <slot name="title-bar"></slot>
    </div>
    <div v-show="!collapsed" class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    collapsible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },

  setup() {
    const collapsed = ref(false);

    return {
      collapsed,
    };
  },
}
</script>

<style scoped>
.panel {
  display: grid;
  grid-template-rows: auto 1fr;
}

.title-bar {
  display: grid;
  grid-template-columns: auto 1fr;
  background-color: inherit;
  font-size: 0.875em;
  min-height: 1em;
  background-color: #024;
  padding: 0.25em 0.25em;
}

.collapsible .title-bar {
  grid-template-columns: auto auto 1fr;
}

.collapse-button {
  display: inline-block;
  width: 1.25em;
  cursor: pointer;
}
</style>
