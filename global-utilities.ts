// Utilities for BGA API
const PredefinedStyles = {
    Selected: "SELECTED",
    Light: "LIGHT",
    LightBackground: "LIGHTBACKGROUND",
    RedSelected: "REDSELECTED",
    Clickable: "CLICKABLE",
    Rounded: "ROUNDED",
    ClickableRounded: "CLICKABLE_ROUNDED"
}

const SelectedTag = 'sbstyle_selected';

function select(id: number) {
    bga.addStyle(id, PredefinedStyles.Selected);
}

function isSelected(id: number): boolean {
    return bga.hasTag(id, SelectedTag);
}

function getSelected() {
    return bga.getElementsArray({ tag: SelectedTag });
}

function deselectAll() {
    bga.removeStyle(bga.getElements({ tag: SelectedTag }), PredefinedStyles.Selected);
}

function deselect(id: number) {
    bga.removeStyle(id, PredefinedStyles.Selected);
}

function setProperties(elementId: number, properties: SettableElementProperties | { [key: string]: string }) {
    var props: ElementsProperties = [];
    props[elementId] = properties;
    bga.setProperties(props);
}

enum Visibilities {
    Everyone = "everyone",
    HideInside = "hideinside"
}

function isVisibility(visibility: string): visibility is Visibility {
    return visibility === Visibilities.Everyone
        || visibility === Visibilities.HideInside
        || Object.keys(bga.getPlayers()).some(color => visibility === `player${color}`);
}

function toVisibility(visibility: string): Visibility {
    if (isVisibility(visibility)) {
        return visibility;
    }
    bga.error(`Visibility '${visibility}' is not valid.`);
}

function setVisibility(id: number, visibility: Visibility) {
    setProperties(id, { visible: visibility });
}

function showToEveryone(id: number) {
    setVisibility(id, toVisibility(Visibilities.Everyone));
}

function hideToEveryone(id: number) {
    setVisibility(id, toVisibility(Visibilities.HideInside));
}

function showOnlyToPlayer(id: number, color: Color) {
    setVisibility(id, toVisibility(`player${color}`));
}