﻿#target InDesignvar INDESIGN = {        SPACES : [ ' ',                  , SpecialCharacters.DISCRETIONARY_LINE_BREAK                 , SpecialCharacters.EN_SPACE                 , SpecialCharacters.FIXED_WIDTH_NONBREAKING_SPACE                 , SpecialCharacters.FIGURE_SPACE                 , SpecialCharacters.FLUSH_SPACE                 , SpecialCharacters.HAIR_SPACE                 , SpecialCharacters.NONBREAKING_SPACE                 , SpecialCharacters.PUNCTUATION_SPACE                 , SpecialCharacters.QUARTER_SPACE                 , SpecialCharacters.SIXTH_SPACE                 , SpecialCharacters.THIN_SPACE                 , SpecialCharacters.THIRD_SPACE                 , SpecialCharacters.ZERO_WIDTH_NONJOINER                 , String.fromCharCode(65279) // XML Tag                 ]       , NEWLINES : [ '\r', '\n', SpecialCharacters.FORCED_LINE_BREAK ]    };INDESIGN.SPACES_CRNL = INDESIGN.SPACES.concat(INDESIGN.NEWLINES);/* InsertionPoins ***************************************************************** */InsertionPoint.prototype.next = function(){    return this.parent.insertionPoints[this.index+1].isValid ?                 this.parent.insertionPoints[this.index+1]               : null;}InsertionPoint.prototype.previous = function(){    return this.parent.insertionPoints[this.index-1].isValid ?                 this.parent.insertionPoints[this.index-1]               : null;}/* Character ********************************************************************** */Character.prototype.next = function(incr){    incr = incr == undefined ? 1 : incr;        return this.parent.characters[this.index+incr].isValid ?                  this.parent.characters[this.index+incr]               : null;}Character.prototype.previous = function(){    return this.parent.characters[this.index-1].isValid ?                 this.parent.characters[this.index-1]               : null;}Character.prototype.isStyled = function(style, ignoreSpace){    var test = this.fontStyle.toUpperCase().contains( style.toUpperCase() );    if (ignoreSpace)        return INDESIGN.SPACES_CRNL.contains(this.contents) || test;            return test;}Character.prototype.isSpace = function(){    return INDESIGN.SPACES.contains(this.contents);}Character.prototype.isDigit = function(){    var digits = "0123456789";    return digits.contains(this.contents);}Character.prototype.isCrLn = function(){    return INDESIGN.NEWLINES.contains(this.contents);}Paragraph.prototype.isEmpty = function(){    return this.words.length === 0;}/* Collections ************************************************************* */function isIndesignCollection(data){    return data.hasOwnProperty('everyItem');}function collectionToArray(coll){    return coll.everyItem().isValid ? coll.everyItem().getElements() : [];}var _coll_toArray = function(reversing) {    var res = this.everyItem().getElements();      return (reversing) ? res.reverse() : res };var _coll_forEach = function(fun) { this.everyItem().getElements().forEach(fun); } ;var _coll_forEachR = function(fun) { this.everyItem().getElements().reverse().forEach(fun); } ;/*  Add new functions to the collections of InDesign,    A Collection is initialized the first time is acceced or don't exists.         Use tip: before using toArray, forEach or forEachR in any collection,             first call this method with the parent object and the collection object name    */var _extend_collection = function(parent, CollectionName) {    // Initialize Collections if needed    parent[ CollectionName[0].toLowerCase() + CollectionName.slice(1) ];    if ($.global[CollectionName].prototype.toArray === undefined) {        $.global[CollectionName].prototype.toArray  = _coll_toArray;        $.global[CollectionName].prototype.forEach  = _coll_forEach;        $.global[CollectionName].prototype.forEachR = _coll_forEachR;    }}    // Extend documets and if any document open, documents usual collections_extend_collection(app, 'Documents');if (app.documents.length  > 0) {    _extend_collection(app.documents[0], 'Pages');    _extend_collection(app.documents[0], 'PageItems');    _extend_collection(app.documents[0], 'TextFrames');    _extend_collection(app.documents[0], 'Stories');}/* Search And Replace ****************************************************** */function prepareSearch(caseSensitive, wholeWord)/*  Inicializa las preferencias de búsqueda	*/{    caseSensitive = caseSensitive ? caseSensitive : false;    wholeWord = wholeWord ? wholeWord : false;    	app.findChangeTextOptions.caseSensitive = caseSensitive;	app.findChangeTextOptions.wholeWord = wholeWord;	app.findTextPreferences.appliedCharacterStyle = null;	app.findTextPreferences.appliedParagraphStyle = null;	app.findGrepPreferences.appliedCharacterStyle = null;	app.findGrepPreferences.appliedParagraphStyle = null;    app.findGrepPreferences.fillColor = null;}function prepareSearchGREP(caseSensitive, wholeWord)/*  Inicializa las preferencias de búsqueda	*/{    caseSensitive = caseSensitive ? caseSensitive : false;    wholeWord = wholeWord ? wholeWord : false;    	app.findGrepPreferences.appliedCharacterStyle = null;	app.findGrepPreferences.appliedParagraphStyle = null;	app.findGrepPreferences.appliedCharacterStyle = null;	app.findGrepPreferences.appliedParagraphStyle = null;    app.findGrepPreferences.fillColor = null;}function saveSearchState()/*  Guarda las preferencias de búsqueda actuales	*/{	var saveState = {};		saveState.old_caseSensitive = app.findChangeTextOptions.caseSensitive;	saveState.old_wholeWord = app.findChangeTextOptions.wholeWord;	saveState.old_textAppliedCharacterStyle = app.findTextPreferences.appliedCharacterStyle;	saveState.old_textAppliedParagraphStyle = app.findTextPreferences.appliedParagraphStyle;	saveState.old_grepAppliedCharacterStyle = app.findGrepPreferences.appliedCharacterStyle;	saveState.old_grepAppliedParagraphStyle = app.findGrepPreferences.appliedParagraphStyle;		return saveState;}function restoreSearchState(saveState)/*  Restaura las preferencias de búsqueda actuales	*/{	app.findChangeTextOptions.caseSensitive = saveState.old_caseSensitive;	app.findChangeTextOptions.wholeWord = saveState.old_wholeWord;	app.findTextPreferences.appliedCharacterStyle = saveState.old_textAppliedCharacterStyle;	app.findTextPreferences.appliedParagraphStyle = saveState.old_textAppliedParagraphStyle;	app.findGrepPreferences.appliedCharacterStyle = saveState.old_grepAppliedCharacterStyle;	app.findGrepPreferences.appliedParagraphStyle = saveState.old_grepAppliedParagraphStyle; }function searchAndReplace(obj, find, change){	app.findTextPreferences.findWhat = find;	app.changeTextPreferences.changeTo = change;	return obj.changeText();}function searchAndReplaceGREP(obj, find, change){	app.findGrepPreferences.findWhat = find;	app.changeGrepPreferences.changeTo = change;	return obj.changeGrep();}/* Groups ****************************************************************** */// Desagrupa al contenedor y todos sus ancestrosfunction ungroup(container){    while (container.parent.constructor.name != 'Application')    {        if (container.parent.constructor.name == 'Group')        {            do {                var repetir = false;                var grupo = container.parent;                var padre = grupo.parent;                // busca el primer grupo                while (padre.constructor.name == 'Group')                {                    grupo = padre;                    padre = padre.parent;                    repetir = true;                }                                    try { grupo.ungroup(); } catch(e) { return ; }            } while (repetir);        }            container = container.parent;    }}// Indica si el contenedor está agrupadofunction isGrouped(container){    while (container.constructor.name != 'Application')    {        if (container.constructor.name == 'Group')            return true;                    container = container.parent;    }            return false;}/* Document **************************************************************** */// Devuelve el documento padre del contenedor suministradofunction document(container){    var parent = container;    while (parent && parent.constructor.name != 'Application' && parent.constructor.name != 'Document')        parent = parent.parent;            return (parent && parent.constructor.name === 'Document') ? parent : null;}/* Layers ****************************************************************** */// Devuelve un objeto del tipo Layer, creandolo si no existe (createIfNotExists == true)function layerByName(doc, layerName, createIfNotExists){    var layer = doc.layers.itemByName(layerName);    if (!layer.isValid)        return (createIfNotExists) ? doc.layers.add( { name:layerName } ) : null;            return layer;}/* Textframes ************************************************************** */function moveAllTextFrames(doc, layerName){    var layer = layerByName(doc, layerName, true);    doc.textFrames.everyItem().locked = false;    doc.textFrames.everyItem().itemLayer = layer;}// Dado un array de textFrames de un mismo documento, los mueve a la capa indicada// creando una nueva capa si no existiera.function moveTextFrames(textFrames, layerName){    var doc = document(textFrames[0]);    var layer = layerByName(doc, layerName, true);            textFrames.forEach( function(tf) {         try {            if (isGrouped(tf))                ungroup(tf);                        tf.locked = false; tf.itemLayer = layer;         } catch(e) { alert(e); }    } );}// Genera una copia exacta de los textframes indicados. Si se pasa el nombre de una capa // se mueven a esta.function cloneTextFrames(textFrames, layerName){    var doc = document(textFrames[0]);     var newTextFrames = [];        textFrames.forEach( function(tf) { var ntf = tf.duplicate(); newTextFrames.push(ntf); } );        if (layerName != undefined)        moveTextFrames(newTextFrames, layerName);        return newTextFrames;}// Busca todas las cajas de texto cuyo contenido cumpla la expresión regularfunction textFramesMatching(container, regex){    return container.allPageItems.filter( function(item) {        return item.has_own('contents') && (regex.test(item.contents));    } );}// Busca todas las cajas de texto cuyo label cumpla regexfunction textFramesLabeled(container, regex){    return container.allPageItems.filter( function(pi) {        return (pi.has_own('label')) && (regex.test(pi.label))    } );}// message -> string -> [string] -> ()function message(title, input) {    // if input is an array, convert it to a string    if(input instanceof Array)    input = input.join ("\r");    var w = new Window ("dialog", title);    var list = w.add ("edittext", undefined, input, {multiline: true, scrolling: true});        // the list should not be bigger than the maximum possible height of the window    list.maximumSize.height = w.maximumSize.height - 100;    list.minimumSize.width = 150;    w.add ("button", undefined, "Close", {name: "ok"});    w.show ();}/*  resolveTextFrame -> object reference -> TextFrame        Given an object return the TextFrame associated if any    */function resolveTextFrame(ref) {    if (!ref) return null;        if (ref.is(TextFrame)) {        return ref;    } else if (ref.has('parentTextFrames')) {        return ref.parentTextFrames[0]    }    return null;}