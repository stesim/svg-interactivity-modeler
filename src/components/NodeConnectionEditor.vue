<template>
  <svg-manipulator class="manipulator" :svgNode="svg" @element-click="onElementClicked">
    <svg-element-stroke-highlight
      v-for="element in localSelection"
      :key="getSvgElementKey(element)"
      :originalElement="element"
      />
  </svg-manipulator>
</template>

<script>
import { computed, inject, reactive } from 'vue';
import SvgElementStrokeHighlight from './SvgElementStrokeHighlight.vue'
import SvgManipulator from './SvgManipulator.vue'

export default {
  components: {
    SvgElementStrokeHighlight,
    SvgManipulator,
  },

  props: {
    svg: SVGSVGElement,
  },

  setup() {
    const controller = inject('controller');
    const {state} = controller;

    const selection = reactive([]);

    const originalOf = inject('originalOf');
    const localCopyOf = inject('localCopyOf');

    const isNode = (element) => {
      return state.nodeElements.includes(element);
    };

    const isConnector = (element) => {
      return state.connectorElements.includes(element);
    };

    const onElementClicked = (localElement) => {
      const element = originalOf(localElement);
      const elementIsNode = isNode(element);
      const elementIsConnector = isConnector(element);
      if (!elementIsNode && !elementIsConnector) {
        return;
      }
      if (selection.length === 0) {
        if (elementIsNode) {
          selection.push(element);
        }
      } else if (!selection.includes(element)) {
        const previousIsNode = isNode(selection[selection.length - 1]);
        if (!(previousIsNode && elementIsNode)) {
          selection.push(element);
          if (elementIsNode) {
            controller.addNodeAssociation(selection);
            selection.splice(0);
            selection.push(element);
          }
        }
      }
    };

    const localSelection = computed(() => selection.map(localCopyOf));

    return {
      getSvgElementKey: inject('getSvgElementKey'),

      onElementClicked,

      localSelection,
    };
  }
}
</script>

<style scoped>
.manipulator {
  width: 100%;
  height: 100%;
}
</style>
