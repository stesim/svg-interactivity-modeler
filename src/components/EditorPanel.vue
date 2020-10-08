<template>
  <ui-panel title="Editor" class="canvas">
    <template #title-bar>
      <div class="mode-list">
        <label v-for="mode in Mode" :key="mode" class="mode-button" :class="{selected: currentMode === mode}">
          <input type="radio" :value="mode" v-model="currentMode" v-show="false"/>{{mode}}
        </label>
      </div>
    </template>
    <template v-if="diagram">
      <svg-manipulator
        v-if="currentMode === Mode.OVERVIEW"
        v-model:viewport="viewport"
        :svgNode="diagram"
        class="overview"
        />
      <classifier-editor
        v-else-if="currentMode === Mode.NODES"
        v-model:viewport="viewport"
        :svg="diagram"
        :markedElements="nodeElements"
        @mark-element="markNode"
        @unmark-element="unmarkNode"
        />
      <classifier-editor
        v-else-if="currentMode === Mode.CONNECTORS"
        v-model:viewport="viewport"
        :svg="diagram"
        :markedElements="connectorElements"
        @mark-element="markConnector"
        @unmark-element="unmarkConnector"
        />
      <node-connection-editor
        v-else-if="currentMode === Mode.ASSOCIATE"
        v-model:viewport="viewport"
        :svg="diagram"
        />
      <sequence-editor
        v-else-if="currentMode === Mode.SEQUENCE"
        v-model:viewport="viewport"
        :svg="diagram"
        />
      <div v-else class="fallback-message">{{`Edit mode "${currentMode}" is not implemented.`}}</div>
    </template>
    <div v-else class="fallback-message">Please load a diagram.</div>
  </ui-panel>
</template>

<script>
import { computed, inject, provide, ref, watchEffect } from 'vue';
import ClassifierEditor from './ClassifierEditor.vue'
import NodeConnectionEditor from './NodeConnectionEditor.vue'
import SequenceEditor from './SequenceEditor.vue'
import SvgManipulator from './SvgManipulator.vue'
import UiPanel from './UiPanel.vue'

const Mode = Object.freeze({
  OVERVIEW: 'OVERVIEW',
  NODES: 'NODES',
  CONNECTORS: 'CONNECTORS',
  ASSOCIATE: 'ASSOCIATE',
  SEQUENCE: 'SEQUENCE',
});

function getAllElements(root) {
  return [...root.querySelectorAll('*')];
}

export default {
  components: {
    ClassifierEditor,
    NodeConnectionEditor,
    SequenceEditor,
    SvgManipulator,
    UiPanel,
  },

  props: {
    defaultMode: {
      type: String,
      default: Mode.OVERVIEW,
    },
  },

  setup(props) {
    const controller = inject('controller');
    const {state} = controller;

    const originalToCopy = new Map();
    const copyToOriginal = new Map();

    const localSvgCopy = computed(() => (state.diagram ? state.diagram.cloneNode(true) : null));
    watchEffect(() => {
      const copy = localSvgCopy.value;
      if (copy) {
        originalToCopy.clear();
        copyToOriginal.clear();

        const original = state.diagram;
        const originalElements = getAllElements(original);
        const copyElements = getAllElements(copy);
        copyElements.forEach((copyElement, index) => {
          const originalElement = originalElements[index];
          originalToCopy.set(originalElement, copyElement);
          copyToOriginal.set(copyElement, originalElement);
        });
      }
    });

    const currentMode = ref(props.defaultMode.toUpperCase());

    const originalOf = (element) => copyToOriginal.get(element);
    const localCopyOf = (element) => originalToCopy.get(element);

    provide('originalOf', originalOf);
    provide('localCopyOf', localCopyOf);

    const nodeElements = computed(() => state.nodeElements.map(localCopyOf));
    const markNode = (element) => controller.markNode(originalOf(element));
    const unmarkNode = (element) => controller.unmarkNode(originalOf(element));

    const connectorElements = computed(() => state.connectorElements.map(localCopyOf));
    const markConnector = (element) => controller.markConnector(originalOf(element));
    const unmarkConnector = (element) => controller.unmarkConnector(originalOf(element));

    const viewport = ref({
      x: 0,
      y: 0,
      zoom: 1,
    });

    return {
      diagram: localSvgCopy,

      Mode,
      currentMode,

      nodeElements,
      markNode,
      unmarkNode,

      connectorElements,
      markConnector,
      unmarkConnector,

      viewport,
    };
  },
}
</script>

<style scoped>
.mode-list {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-button {
  margin: 0 0.125em;
  padding: 0.25em;
  cursor: pointer;
  font-size: 0.875em;
  font-weight: bold;
}

.mode-button.selected {
  color: aqua;
  box-shadow: inset 0 0 0.25em rgba(255, 255, 255, 0.25);
  border-radius: 0.25em;
  background-color: rgba(255, 255, 255, 0.125);
}

.overview {
  width: 100%;
  height: 100%;
}

.fallback-message {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-color-text-dark);
}
</style>
