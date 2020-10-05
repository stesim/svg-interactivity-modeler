const { reactive, readonly, watch } = require('vue');

export default class AppController {
  constructor() {
    this._state = reactive({
      diagram: null,

      nodeElements: [],
      connectorElements: [],
      nodeAssociations: [],
    });
    this._readOnlyState = readonly(this._state);

    this._elementToIdMap = new Map();
    this._elementIdCounter = 0;
    watch(() => this._state.diagram, () => {
      this._state.nodeElements.splice(0);
      this._state.connectorElements.splice(0);
      this._state.nodeAssociations.splice(0);

      this._elementToIdMap.clear();
      this._elementIdCounter = 0;
    });
  }

  get state() {
    return this._readOnlyState;
  }

  get diagram() {
    return this._state.diagram;
  }

  set diagram(value) {
    this._state.diagram = value;
  }

  getElementId(element) {
    let id = this._elementToIdMap.get(element);
    if (id === undefined) {
      id = this._elementIdCounter++;
      this._elementToIdMap.set(element, id);
    }
    return id;
  }

  markNode(element) {
    if (!this._state.nodeElements.includes(element)) {
      this._state.nodeElements.push(element);
    } else {
      throw new Error('element is already a node');
    }
  }

  unmarkNode(element) {
    if (this._state.nodeElements.includes(element)) {
      this._state.nodeElements.splice(
        this._state.nodeElements.indexOf(element),
        1);
    } else {
      throw new Error('element is not a node');
    }
  }

  markConnector(element) {
    if (!this._state.connectorElements.includes(element)) {
      this._state.connectorElements.push(element);
    } else {
      throw new Error('element is already a connector');
    }
  }

  unmarkConnector(element) {
    if (this._state.connectorElements.includes(element)) {
      this._state.connectorElements.splice(
        this._state.connectorElements.indexOf(element),
        1);
    } else {
      throw new Error('element is not a connector');
    }
  }

  addNodeAssociation(connection) {
    // TODO: validate connection elements (node -> connector... -> node)
    this._state.nodeAssociations.push([...connection]);
  }
}
