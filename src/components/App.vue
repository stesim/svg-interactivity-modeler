<template>
  <div class="main" @keyup.esc.exact="setMode(Mode.OVERVIEW)" @keydown.n.exact="setMode(Mode.NODES)" @keydown.c.exact="setMode(Mode.CONNECTORS)" @keydown.a.exact="setMode(Mode.ASSOCIATE)" @keydown.s.exact="setMode(Mode.SEQUENCE)" tabindex="0">
    <div class="left-panel">
      <ui-panel title="Open diagram" :collapsible="true" class="ui-panel" style="overflow: hidden">
        <div>
          <input type="file" accept=".svg" @change="onFileSelected" :disabled="svgIsLoading"/>
        </div>
      </ui-panel>
      <ui-panel title="Sandbox" :collapsible="true" class="ui-panel">
        Hello, world!
      </ui-panel>
    </div>
    <div class="editor-panels">
      <editor-panel collapsible class="ui-panel" defaultMode="nodes"/>
      <editor-panel collapsible class="ui-panel" defaultMode="connectors"/>
    </div>
    <div class="status-bar">
      <div class="status-label">{{statusMessage}}</div>
    </div>
  </div>
</template>

<script>
import { provide, ref } from 'vue';
import AppController from '../app-controller'
import EditorPanel from './EditorPanel.vue'
import UiPanel from './UiPanel.vue'

export default {
  components: {
    EditorPanel,
    UiPanel,
  },

  props: {
  },

  setup() {
    // APP STATE
    const controller = new AppController();
    provide('controller', controller);

    // STATUS
    const statusMessage = ref('Welcome!');
    const setStatus = (message) => { statusMessage.value = message };

    // SVG LOADING/RENDERING
    const svgIsLoading = ref(false);

    const onFileSelected = (evt) => {
      const [file] = evt.target.files;
      if (file) {
        svgIsLoading.value = true;
        setStatus(`Loading ${file.name}...`);
        file.text().then((svgString) => {
          svgIsLoading.value = false;
          setStatus(`Loaded ${file.name}`);

          const svgDocument = new DOMParser().parseFromString(svgString, 'image/svg+xml');
          controller.diagram = svgDocument.rootElement;
        });
      }
    }

    provide('getSvgElementKey', (element) => controller.getElementId(element));

    return {
      statusMessage,

      onFileSelected,
      svgIsLoading,
    };
  },
}
</script>

<style>
body, html {
  background-color: #2c3e50;
  color: #eee;
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style scoped>
.main {
  height: 100vh;
  display: grid;
  grid-template-columns: 20em 1fr;
  grid-template-rows: 1fr auto;
  user-select: none;
}

.left-panel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0.5em;
}

.left-panel > .ui-panel:not(:first-child) {
  margin-top: 0.5em;
}

.left-panel .ui-panel >>> .content {
  padding: 0.5em;
  background-color: #2c3e50;
}

.ui-panel {
  border: 1px solid #012;
  box-shadow: 0.125em 0.125em 0.25em rgba(0, 0, 0, 0.5);
}

.editor-panels {
  display: flex;
  flex-direction: column;
  margin: 0.5em;
}

.editor-panels > .ui-panel {
  flex-grow: 1;
}

.editor-panels > .ui-panel:not(:first-child) {
  margin-top: 0.5em;
}

.editor-panels > .ui-panel.collapsed {
  flex-grow: 0;
}

.status-bar {
  grid-column: 1 / span 2;
  padding: 0.5em;
  background-color: #012;
  font-size: 0.875em;
  min-height: 1em;
}

.status-label {
  overflow: hidden;
  height: 100%;
  color: #bbb;
}
</style>
