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
import { computed, inject, ref } from 'vue';
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

    const selection = ref([]);

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
      if (selection.value.length === 0) {
        if (elementIsNode) {
          selection.value.push(element);
        }
      } else if (!selection.value.includes(element)) {
        if (elementIsConnector || selection.value.length > 1) {
          selection.value.push(element);
        }
        if (elementIsNode) {
          if (selection.value.length > 1) {
            controller.addNodeAssociation(selection.value);
          }
          selection.value = [element];
        }
      } else {
        selection.value = selection.value.slice(
          0,
          selection.value.indexOf(element));
      }
    };

    const localSelection = computed(() => selection.value.map(localCopyOf));

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
