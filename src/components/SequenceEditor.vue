<template>
  <svg-manipulator
      class="manipulator"
      :svgNode="svg"
      @element-click="onElementClicked"
      @keyup.enter.prevent="commitSequence"
      tabindex="0"
      >
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
    const selection = ref([]);

    const originalOf = inject('originalOf');
    const localCopyOf = inject('localCopyOf');

    const controller = inject('controller');
    const isNode = (element) => controller.isNode(element);

    const onElementClicked = (localElement) => {
      const element = originalOf(localElement);
      if (!isNode(element)) {
        return;
      }
      if (selection.value.length === 0) {
        selection.value.push(element);
      } else if (!selection.value.includes(element)) {
        const previousNode = selection.value[selection.value.length - 1];
        const association = controller.getNodeAssociation(previousNode, element);
        if (association) {
          selection.value.push(...association.slice(1));
        }
      } else {
        let previousNodeIndex = -1;
        for (let i = selection.value.indexOf(element) - 1; i >= 0; --i) {
          if (isNode(selection.value[i])) {
            previousNodeIndex = i;
            break;
          }
        }
        selection.value.splice(previousNodeIndex + 1);
      }
    };

    const commitSequence = () => {
      if (selection.value.length > 1) {
        controller.addSequence(selection.value);
        selection.value = [];
      }
    };

    const localSelection = computed(() => selection.value.map(localCopyOf));

    return {
      getSvgElementKey: inject('getSvgElementKey'),

      onElementClicked,
      commitSequence,

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
