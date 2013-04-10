﻿#target "indesign"#strict on// http://extendables.org/#include "~/_scripts/frameworks/Extendables/extendables.jsx"#include "~/_scripts/lib/indesign.jsx"#include "lib/IKEA.jsx"#include "~/_scripts/lib/timer.jsx"var ui = require("ui");var errors = [];function UI(){    var dialog = new ui.Dialog('Códigos IKEA Catálogo'); //.with(mixins);    dialog.column('col').row('rowMode');    dialog.col.rowMode.radio('rbCorto', 'Generar códigos CORTOS XXX');     dialog.col.rowMode.radio('rbLargo', 'Generar códigos LARGOS XXX.XXX.XXX');     dialog.col.row('options').checkbox('noReplace', 'Mantener los dos códigos');    dialog.col.row('buttons');    dialog.col.buttons.button('ok', 'Aceptar');    dialog.col.buttons.button('cancel', 'Cerrar');        dialog.col.rowMode.rbCorto.value = true;    dialog.col.options.noReplace.value = true;        dialog.window.defaultElement = dialog.col.buttons.ok;    dialog.window.cancelElement = dialog.col.buttons.cancel;    dialog.col.buttons.cancel.on('click').do(function() { this.window.close(); } );    dialog.options = {};    if (dialog.window.show())        return dialog.options;}/*  Esctructura de la página web resultante:    <table ... >        <tr> ... fila de título ... </tr>        <tr ... >            <td>CÓDIGO CORTO</td>            <td>CÓDIGO LARGO</td>            <td>DESCRIPCIÓN PRODUCTO</td>            <td>FAMILIA</td>        </tr>    </table>        La función devuelve un objeto con la forma { codigo_corto, codigo_largo, descripcion, familia }    */function codeInfoFor(code, isShortCode){	var script;		if (isShortCode) 		script = 'do shell script "/usr/bin/curl -d \'cod_corto=' + code + '&cod_largo=';	else		script = 'do shell script "/usr/bin/curl -d \'cod_corto=&cod_largo=' + code;		script += '&campo=almcod&orden=asc&pag=1&ruta_base=codarticulos/\' ' +			 'http://zona.ikeasi.com/codarticulos/resultado.php"';				var html = app.doScript(script, ScriptLanguage.APPLESCRIPT_LANGUAGE);    if (html != "") {        html = html.toLowerCase();                if (html.indexOf('sin resultados') > -1)             return null;                    var tds = html.split('<tr').slice(2).join('')                      .split('<td>').slice(1)                      .map( function(td) {                           return td.split('</td>')[0];                       } );        return { codigo_corto : tds[0]               , codigo_largo : tds[1]               , descripcion  : tds[2]               , familia      : tds[3]               , toString:function() { return "C.Corto: %1\nC.Largo: %2\nDescripción: %3\nFamilia"                                              .replace("%1", this.codigo_corto)                                              .replace("%2", this.codigo_largo)                                              .replace("%3", this.descripcion)                                              .replace("%4", this.familia);                                      }                };    }        }function codesInDocument(doc, isShortCode){    var re = (isShortCode)  ?             /\b[A-Z]{3,4}\b/gm :             /\b\d{3}\.\d{3}\.\d{2}\b/gm;    var codes = [];    var testForRE = function(w) {            if ( re.test(w.contents)                  && (! isShortCode || w.appliedCharacterStyle.name == IKEA.ALMSTYLE) ) {                        codes.push(w);             }        };            doc.allPageItems.filter( function(pi) {                         return (pi instanceof TextFrame && re.test(pi.contents)); })                    .forEach(function(pi) {                         collectionToArray(pi.words).forEach( testForRE );                    });    doc.allPageItems.filter( function(pi) {                         return (pi instanceof TextFrame && pi.tables.length > 0 && re.test(pi.tables[0].contents.toString())); })                    .forEach(function(pi) {                        collectionToArray(pi.tables).forEach( function(t) {                            collectionToArray(t.cells).forEach(function (c) {                                collectionToArray(c.words).forEach( testForRE );                            });                        } );                    });        alert(codes.length);    return codes;}function loadCache(fileName, isShortCode, sep){    if (fileName == null || !File(fileName).exists) return null;        if (sep == undefined) sep = ',';        var data = [];    var stream = function() {        var f = File(fileName); f.open(); var r = f.read(); f.close(); return r;     }();    var formatCode = function(c) {        c = c.replace(/\./g, '');        while (c.length < 8) c = '0' + c;        return c;    }    var data = {};    var st = stream();    if (st)        st.split('\n').filter( function(line) { return ! isNaN(line.split(sep)[0]); })                  .forEach( function (line) {                       var d = line.split(sep);                       if (isShortCode)                        data[d[1]] = formatCode(d[0]); // data["XXX"] = "dddddddd"                      else                        data[formatCode(d[0])] = d[1]; // data["dddddddd"] = "XXX"                  });            return data;}function saveCache(fileName, wCodes, codes, isShortCode){    if (!codes) return ;        var f = File(fileName);     f.open();     var saved = [];    for (ref in codes) {        if (! isShortCode && ! isNaN(Number(codes[ref])))        {            if (saved.indexOf(ref) == -1 )            {                f.write(ref, codes[ref]);                saved.push(ref);            }        }        if (isShortCode)        {            if (saved.indexOf(ref) == -1 )            {                f.write(codes[ref], ref);                saved.push(ref);            }        }    }        f.close();}/*  Reemplaza los códigos en el array de Words `wCodes`, usando como tabla de referencia los códigos en ´codes´    */function replaceCodes(wCodes, codes, isShortCode){    var getCode = function(text, re) { return [text.match(re).join(''), text.split(re).join('')] };            wCodes.forEach( function(w) {        // la palabra puede tener símbolos (puntos, paréntesis, etc.) después del código, contemplarlo        var r = getCode(w.contents, (isShortCode) ? /\b[A-Z]{3,4}\b/gm : /\d{3}\.\d{3}\.\d{2}/gm);        var ref = r[0];        var resto = r[1];        var code = (codes[ref] == null) ? codeInfoFor(ref, isShortCode) : codes[ref];        var code_d = code.constructor.name == "Object" ? code.codigo_largo : code;        if (code != null) {            w.contents = (! isShortCode) ? code : "%1.%2.%3".replace("%1", code_d.slice(0, 3))                                                            .replace("%2", code_d.slice(3, 6))                                                            .replace("%3", code_d.slice(6, 9));            w.contents += resto;        } // else errors.push(ref);        else errors.push(ref);    });    return codes;}function errorInform(){	var wndResource =		"dialog \		 { \			orientation:'column', \			text: 'INFORMACIÓN DE ERRORES', \			mainPanel: Panel \			{ \				label1: StaticText { text:'Listado de códigos huérfanos.', }, \				listbox1: ListBox { preferredSize:[350, 200], }, \			}, \			bPanel: Group \			{ \				open:  Button { text:'Abrir como texto', }, \				close: Button { text:'Close', }, \			} \		 }"	var dlg = new Window(wndResource);	dlg.error = errors;		dlg.bPanel.close.onClick = function() { dlg.close(); }	dlg.bPanel.open.onClick = function() 	{		var i=1;				while (File('~/tmp_codalm_errors_' + i + '.txt').exists) 			++i;				var f = new File('~/tmp_codalm_errors_' + i + '.txt');		f.open("w");		for (var i=0, end=this.window.error.length; i<end; ++i)			f.writeln(this.window.error[i]);					f.close();		f.execute();				dlg.close(); 	}			for (var i=0, end=dlg.errors.length; i<end; ++i)		dlg.mainPanel.listbox1.add('item', dlg.errors[i]);	dlg.show();}function CodigosCatalogo(){	if (app.documents.length == 0) return ;        var args = UI();    if (args)    {//        args.isShortToLargeCode = true;//        args.replacing = true;                var codes = loadCache(IKEA.CACHEDCODES, args.isShortToLargeCode);        var wCodes = codesInDocument(app.activeDocument, true);                codes = (args.replacing ? replaceCodes : appendCodes)(wCodes, codes, args.isShortToLargeCode);                saveCache(IKEA.CACHEDCODES, wCodes, codes, args.isShortToLargeCode);    }        return 0;}timeDiff.setStartTime();alert('No funciona.\nUsar en su lugar Insertar/Reemplazar Códigos IKEA.\nGracias');//~ app.doScript(function () { CodigosCatalogo(); },//~     ScriptLanguage.JAVASCRIPT //~   , null//~   , UndoModes.ENTIRE_SCRIPT //~   , 'Codigos IKEA'//~ );// $.writeln("Script execution time: " + timeDiff.getDiff() / 1000 + " seconds");