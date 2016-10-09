
// Create default menu items for OSX
if (Steedos.isNode() && Steedos.isMac()) {
    var mb = new nw.Menu({ type: "menubar" });
    mb.createMacBuiltin(gui.App.manifest.productName);   
    nw.Window.get().menu = mb;

}