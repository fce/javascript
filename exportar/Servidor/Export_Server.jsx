﻿#target indesign#targetengine "medianis"#strict on#include "../../lib/LibExportServer.jsx"var INDESIGN_FOLDER = File('~/Public/exportar_indesign');var DONE_FOLDER = File('~/Public/terminados');var PDF_FOLDER = File('~/Public/resultado_pdf');function main() {    if (app.idleTasks.itemByName('export_server').isValid) {        alert('El servidor ya está funcionando. Ciérrelo primero.');        return ;    }        if (!Folder(INDESIGN_FOLDER).exists)        Folder(INDESIGN_FOLDER).create()    if (!Folder(DONE_FOLDER).exists)        Folder(DONE_FOLDER).create()    if (!Folder(PDF_FOLDER).exists)        Folder(PDF_FOLDER).create()        task = app.idleTasks.add( {name:"export_server",sleep:3000} );    task.addEventListener("onIdle", do_task);        W = mainWindow(INDESIGN_FOLDER, PDF_FOLDER, DONE_FOLDER);    W.show();}main();