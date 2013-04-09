﻿#target "Indesign"#strict on// http://extendables.org/#include "~/_scripts/frameworks/Extendables/extendables.jsx"// custom extensions#include "~/_scripts/lib/indesign.jsx"var expression = /\d{3}\.\d{3}\.\d{2}/gm ;var TEST_ARTICLE = /\$\d+(\.\d\d)?/gm ;var MONEY = '$';// Etiqueta la lista de textframes, según coincidencia con la expresión regularfunction labelTextFrames(textFrames, regex){    textFrames.forEach( function(tf) {        if (regex.test(tf.contents))        {            var c = tf.contents.match(regex);            var re = [];            c.forEach( function(e) { if (re.contains()) re.push(e); } );                    tf.label = re.join(',');        }    } );}function createWebLayer(){    if (layerByName(app.activeDocument, 'web') != null)        return app.activeDocument.allPageItems                  .filter( function(e) { return e.itemLayer.name == 'web' } );            var textFrames = textFramesMatching(app.activeDocument, expression);        moveTextFrames(textFrames, "codigos");        var webTextFrames = cloneTextFrames(textFrames, "web");    labelTextFrames(webTextFrames, expression);        layerByName(app.activeDocument, "codigos").visible = false;        return webTextFrames;}// Busca todas las cajas de texto cuyo contenido cumpla la expresión regularfunction textFramesMatching_(container){    return container.allPageItems.filter( function(item) {        return item.has_own('contents') && (has_codalm(item));    } );}// Busca todas las cajas de texto cuyo contenido cumpla la expresión regularfunction textFramesMatching(container, rg){    return container.allPageItems.filter( function(item) {        return item.has_own('contents') && (rg.test(item.contents));    } );}function has_codalm(item){    var c = 0;    for (var i=0, e=item.characters.length; i<e; ++i)    {        if (item.characters[i].appliedCharacterStyle.name.slice(0,6) == 'AlmCOD')        {            ++c;            if (c > 2) return true;        }    }    return c > 2;}function sanitize(textFrame){    if (textFrame.overflows)        textFrame.fit(FitOptions.FRAME_TO_CONTENT);     if (textFrame.geometricBounds[2] > app.activeDocument.pages[0].bounds[2])        textFrame.geometricBounds[3] += 150;     textFrame.recompose();}function readArt(ch) {    while ( ch && ch.isValid && (ch.isSpace() || ch.isStyled('Bold')) )        ch = ch.next();    return ch;}function readDsc(ch) {    while ( ch && ch.isValid && (ch.isSpace() || !ch.isStyled('Bold')) )        ch = ch.next();    return ch;}function editContent(textFrame){    var chs = textFrame.characters;    var ch = chs[0];    var isArticle = function(txt) { return TEST_ARTICLE.test(txt); }    while (ch && ch.isValid)     {        // ignora blancos y texto no negrita antes primer artículo        ch = readDsc(ch);        if (!ch) break ;                    // recorre la parte Negrita del texto        var i0 = ch.index;        ch = readArt(ch);            if (!ch || !ch.isValid) break;                var i1 = ch.index-1;                var art = chs.itemByRange(i0, i1);        if (art.isValid) art = art.contents;        else break;                    ch = readDsc(ch);                       if (isArticle(art))        {            var i2;            if (!ch || !ch.isValid)                 i2 = chs.length-1;            else                i2 = ch.index-1;                            if (i1 == i2) break;                            var dst = chs.itemByRange(i1, i2).contents;                        if (dst.length > 0)            {                dst = dst.toString();                                var i = 1;                if (/\d{3}\.\d{3}\.\d{2}/m.test(dst))                {                    var m = dst.match(/\d{3}\.\d{3}\.\d{2}/m).toString();                    var t = m + '\r\r';                    chs.itemByRange(i1, i2).contents = ' ' + t;                    i += m.length;                }                else                 {                    if (chs.itemByRange(i2+1, i2+1).isValid && chs.itemByRange(i2+1, i2+1).contents == '\r')                        chs.itemByRange(i1, i2).contents = '\r';                    else                        chs.itemByRange(i1, i2).contents = '\r\r';                }                                    ch = chs[i1+i];            }                    sanitize(textFrame);        }    }    correccionesPostProceso(textFrame);}function allCaps(texto){    var w = texto.indexOf(' ') >= 0 ? texto.split(' ')[0] : texto;    return (w == w.toUpperCase());}function correccionesPostProceso(textFrame){    var readBoldText = function(p) {        var ch = p.characters[0];        var text = '';        while ( ch && ch.isValid && (ch.isSpace() || ch.isStyled('Bold')) )        {            text += ch.contents;            ch = ch.next();        }            return text;    }    var readBoldTextBackward = function(p) {        var ch = p.characters[0];        var text = '';        while ( ch && ch.isValid && (ch.isSpace() || ch.isStyled('Bold')) )        {            text = ch.contents + text;            ch = ch.previous();        }            return text;    }        /*  Procesa series: las series no tienen porqué ser lo primero de la caja de texto, además        puede haber artículos antes y despues de la serie. Se detecta el comienzo de la serie porque        aparece el nombre de la serie y la palabra 'serie'. El final de la serie está marcado porque        aparece otro nombre de artículo todo en mayúsculas. OJO, los artículos pueden empezar por número        o no.        */    if (textFrame.contents.indexOf('serie') >= 0)    {        var p = textFrame.contents.indexOf('serie')-1;        var serie = readBoldTextBackward(textFrame.characters[p]);         var serieName = serie.replace(/ $/,'').replace(/^ /,'')                // elimina la serie y su descripción        var from = p-serie.length+1;        var c = readArt(textFrame.characters[p]);        c = readDsc(c);        textFrame.characters.itemByRange(from, c.index-1).remove();        var begin = c.index;                for (var i=0, e=textFrame.paragraphs.length; i<e; ++i)        {            // ignora líneas vacias de separación            if (textFrame.paragraphs[i].contents.replace(/\s+/, '').length == 0)                 continue;                                           var ch = textFrame.paragraphs[i].characters[0];            // se salta el número si lo hay            if (ch.isDigit())            {                while (!ch.isSpace()) ch = ch.next();                ch = ch.next();            }                        var word = readBoldText(ch).replace(/^\s+/,'');             if (allCaps(word) || ch.capitalization == Capitalization.ALL_CAPS)                continue;                        // ignora párrafos anteriores a la serie            if (ch.index < begin)                continue;                         // inserta nombre de la serie            if (ch.contents != ' ')             {                ch.contents = ch.contents.toLowerCase();                ch.insertionPoints[0].contents += ' ';              }            ch.insertionPoints[0].contents += serieName;            if (serieName[0] >= '0' || serieName[0] <= '9')                serieName = serieName.replace(/\d+\.\s/,'');            ch.parent.characters.itemByRange(ch.index, ch.index+serieName.length).fontStyle = 'Bold';                                 }      }        // Una vez ajustado, buscar artículos con varios modelos (Ej. INDIRA colcha 150x250 y 250x250).    // Se los reconoce porque los siguientes códigos aparecen solo con el precio en negrita.    if (textFrame.paragraphs.length > 1)    {        var boldText = readBoldText( textFrame.paragraphs[0] );        for (var i=1, e=textFrame.paragraphs.length; i<e; ++i)        {            if (textFrame.paragraphs[i].contents.replace(/\s+/, '').length == 0)                 continue;                        var text = readBoldText( textFrame.paragraphs[i] );            if (text[0] == MONEY)            {                var t = boldText.split(MONEY)[0];                if (t.split(' ').length > 1)                    textFrame.paragraphs[i].insertionPoints[0].contents += t.split(' ')[0].toUpperCase() + ' ' + t.split(' ').slice(1).join(' ');                else                    textFrame.paragraphs[i].insertionPoints[0].contents += t.toUpperCase();                try { textFrame.paragraphs[i].characters.itemByRange(0, t.length).fontStyle = 'Bold'; } catch(e) {} ;            }                            if (text != '')                boldText = text;        }    }    // Si algunos párrafos tienen número y otros no, identar los que no por ser subgrupos del numerado    if (textFrame.paragraphs.length > 1)    {        var flag = false;        for (var i=0, e=textFrame.paragraphs.length; i<e; ++i)        {            if (textFrame.paragraphs[i].contents == '') continue;                        if ( textFrame.paragraphs[i].characters[0].isDigit() )                flag = true;                            if (flag && !textFrame.paragraphs[i].characters[0].isDigit())                textFrame.paragraphs[i].insertionPoints[0].contents += '    ';        }    }}function ProgressBar(count, title, parent){    var rce = "window \                 { \                    orientation:'row', \                    alignChildren:'bottom', \                    text: 'PROGRESO', \                    mainPanel: Panel \                    { \                        label1: StaticText { text: 'Progreso total', preferredSize:[275, 20], }, \                        pgBar1: Progressbar { text: '', preferredSize:[275, 10], }, \                        labelLog: StaticText { text: '', preferredSize:[275,20], }, \                    }, \                 }";         	this.wnd = new Window(rce);	this.wnd.mainPanel.pgBar1.maxvalue = count;    this.wnd.text = title ? title : "";	if (parent && parent instanceof Window) 		this.PARENT = parent;	this.step = function(msg)	{        var f = false;        if (!app.scriptPreferences.enableRedraw)            { app.scriptPreferences.enableRedraw = true; f = true; }                    this.wnd.mainPanel.pgBar1.value++;        if (msg) this.wnd.mainPanel.label1.text = msg;                if (f) app.scriptPreferences.enableRedraw = false;	}	this.show = function()	{		this.wnd.show(); 		if (this.PARENT != undefined && this.PARENT.visible)			this.wnd.frameLocation.y = this.PARENT.frameLocation.y - Math.round(this.wnd.size.height * 1.5);	}		this.close = function() { this.wnd.close(); }	this.hide = function() { this.wnd.hide(); }		return this;}function prepareContentToWeb(textFrames){    var pg = new ProgressBar(textFrames.length, 'Preparando Catálogo');    pg.show();        var errors = [];    textFrames.forEach( function(tf) {        try {            editContent(tf);             pg.step(tf.id);        } catch(e) { pg.step('Error en TextFrame ID:' +tf.id + ' =>' + e); errors.push(tf.id); } ;    } );    pg.close();    return errors;}function UI(count, title, parent){    var rce = "window \                 { \                    orientation:'row', \                    alignChildren:'bottom', \                    text: 'PROGRESO', \                    mainPanel: Panel \                    { \                        label1: StaticText { text: 'Progreso total', preferredSize:[275, 20], }, \                        pgBar1: Progressbar { text: '', preferredSize:[275, 10], }, \                        labelLog: StaticText { text: '', preferredSize:[275,20], }, \                    }, \                 }";         	this.wnd = new Window(rce);}function main(){       var errors = prepareContentToWeb(createWebLayer());    if (errors.length) {        var log = File(Folder.temp + '/catalogo.txt');        log.open('w');        errors.forEach( function(e) { log.writeln(e.toString()); } );        log.close();        log.execute();    }    app.scriptPreferences.enableRedraw = true;}app.doScript(main,    ScriptLanguage.JAVASCRIPT   , null  , UndoModes.ENTIRE_SCRIPT   , 'Catalogo WEB');