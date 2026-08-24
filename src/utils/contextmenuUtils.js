function isContextMenuKey(ev) {
    let keys = ["Enter", "Escape", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"];
    // L'event s'ha produït en un Dropdown amb buscador
    let dropdownVisible = ev?.originalTarget?.getAttribute('role') === "searchbox";
    // L'event s'ha produït en un contextMenu amb alguna key que pot afectar el comportament del contextMenu
    let autoCompleteOverlayVisible = ev?.originalTarget?.__vueParentComponent?.ctx.overlayVisible;
    let procedeixComponent = ev.originalTarget.nodeName === "UL"            // Des d'un contextMenu
        || autoCompleteOverlayVisible    // Des d'un autocomplete amb overlayVisible
        || dropdownVisible;
    return procedeixComponent && keys.includes(ev.key);
}

export { isContextMenuKey }