<template>
  <div class="main" :style="style" @keyup.esc.exact="setMode(Mode.OVERVIEW)" @keydown.n.exact="setMode(Mode.NODES)" @keydown.c.exact="setMode(Mode.CONNECTORS)" @keydown.a.exact="setMode(Mode.ASSOCIATE)" @keydown.s.exact="setMode(Mode.SEQUENCE)" tabindex="0">
    <div class="left-panel">
      <ui-panel title="Open diagram" :collapsible="true" class="ui-panel" style="overflow: hidden">
        <div>
          <input type="file" accept=".svg" @change="onFileSelected" :disabled="svgIsLoading"/>
        </div>
      </ui-panel>
      <ui-panel title="Editor layout" :collapsible="true" class="ui-panel">
        <label class="list-radio-button"><input type="radio" value="column" v-model="editorLayout"/> Vertical</label>
        <label class="list-radio-button"><input type="radio" value="row" v-model="editorLayout"/> Horizontal</label>
      </ui-panel>
      <ui-panel title="Theme" :collapsible="true" class="ui-panel">
        <div style="display: grid; grid-template-columns: auto 1fr">
          <template v-for="(value, key) in theme" :key="key">
            <label style="margin-right: 0.5em">{{key}}</label>
            <input type="range" min="0" :max="key === 'hue' ? 360 : 100" v-model="theme[key]"/>
          </template>
        </div>
      </ui-panel>
      <ui-panel title="Sandbox" :collapsible="true" class="ui-panel">
        Hello, world!
      </ui-panel>
    </div>
    <div class="editor-panels" :style="{flexDirection: editorLayout}">
      <editor-panel :collapsible="editorLayout === 'column'" class="ui-panel" defaultMode="nodes"/>
      <editor-panel :collapsible="editorLayout === 'column'" class="ui-panel" defaultMode="connectors"/>
    </div>
    <div class="status-bar">
      <div class="status-label">{{statusMessage}}</div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, provide, ref } from 'vue';
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

    // LAYOUT
    const editorLayout = ref('column');

    // THEMING
    const theme = ref({hue: 0, saturation: 0, lightness: 0});
    onMounted(() => {
      theme.value = {
        hue: 210,
        saturation: 25,
        lightness: 20,
      };
    });
    const style = computed(() => ({
      '--theme-hue': theme.value.hue,
      '--theme-saturation': `${theme.value.saturation}%`,
      '--theme-lightness': `${theme.value.lightness}%`,
    }));

    return {
      statusMessage,

      onFileSelected,
      svgIsLoading,

      editorLayout,
      theme,
      style,
    };
  },
}
</script>

<style>
body, html {
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
  --theme-lightness-text: calc(4.5 * var(--theme-lightness));
  --theme-lightness-text-dark: calc(0.8 * var(--theme-lightness-text));
  --theme-saturation-dark: calc(4 * var(--theme-saturation));
  --theme-lightness-dark: calc(0.67 * var(--theme-lightness));
  --theme-color-bg: hsl(var(--theme-hue), var(--theme-saturation), var(--theme-lightness));
  --theme-color-dark: hsl(var(--theme-hue), var(--theme-saturation-dark), var(--theme-lightness-dark));
  --theme-color-text: hsl(0, 0%, var(--theme-lightness-text));

  background-color: var(--theme-color-bg);
  color: var(--theme-color-text);
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
}

.ui-panel {
  border: 1px solid #012;
  box-shadow: 0.125em 0.125em 0.25em rgba(0, 0, 0, 0.5);
}

.editor-panels {
  display: flex;
}

.editor-panels > .ui-panel {
  flex-grow: 1;
  margin: 0.5em;
}

.editor-panels > .ui-panel.collapsed {
  flex-grow: 0;
}

.list-radio-button {
  display: block;
}

.status-bar {
  grid-column: 1 / span 2;
  padding: 0.5em;
  background-color: var(--theme-color-dark);
  font-size: 0.875em;
  min-height: 1em;
}

.status-label {
  overflow: hidden;
  height: 100%;
  color: var(--theme-color-text-dark);
}
</style>
