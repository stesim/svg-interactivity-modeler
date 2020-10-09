<template>
  <div class="property-editor-grid">
    <svg-manipulator class="manipulator" v-model:viewport="localViewport" :svgNode="svg" @element-click="onElementClicked">
      <svg-element-stroke-highlight v-if="selection" :originalElement="selection"/>
    </svg-manipulator>
    <ui-panel collapsible title="Properties">
      <div v-if="selection" class="property-list">
        <template v-for="(value, key) in properties" :key="key">
          <span class="key">{{key.toUpperCase()}}:</span><span class="value">{{value}}</span>
        </template>
      </div>
      <div v-show="!selection" style="padding: 0.5em; text-align: center">
        Select an element to view properties.
      </div>
    </ui-panel>
  </div>
</template>

<script>
import { computed, inject, ref } from 'vue';
import SvgElementStrokeHighlight from './SvgElementStrokeHighlight.vue'
import SvgManipulator from './SvgManipulator.vue'
import UiPanel from './UiPanel.vue'

export default {
  components: {
    SvgElementStrokeHighlight,
    SvgManipulator,
    UiPanel,
  },

  props: {
    svg: SVGSVGElement,
    viewport: Object,
  },

  setup(props, {emit}) {
    const localViewport = computed({
      get: () => props.viewport,
      set: (value) => { emit('update:viewport', value) },
    });

    const originalOf = inject('originalOf');

    const controller = inject('controller');
    const isNode = computed(
      () => !!selection.value && controller.state.nodeElements.includes(originalOf(selection.value)));
    const isConnector = computed(
      () => !!selection.value && controller.state.connectorElements.includes(originalOf(selection.value)));

    const selection = ref(null);
    const properties = computed(() => (selection.value && {
      type: selection.value.tagName,
      id: selection.value.id ?? '',
      node: isNode.value,
      connector: isConnector.value,
    }));

    const onElementClicked = (element) => {
      if (element !== selection.value &&
          element instanceof SVGElement &&
          !(element instanceof SVGSVGElement)) {
        selection.value = element;
      } else {
        selection.value = null;
      }
    };

    return {
      localViewport,

      selection,
      properties,
      onElementClicked,
    };
  }
}
</script>

<style scoped>
.property-editor-grid {
  display: grid;
  grid-template-rows: 1fr auto;
  width: 100%;
  height: 100%;
}

.manipulator {
  width: 100%;
  height: 100%;
}

.property-list {
  display: grid;
  grid-template-columns: auto 1fr;
  padding: 0.5em;
}

.property-list > .key {
  margin-right: 0.5em;
}
</style>
