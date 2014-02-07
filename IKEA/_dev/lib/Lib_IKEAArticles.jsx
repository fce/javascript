﻿/** IKEA Articles API    Author: Javier Ramos        Dependencies: extentables, Lib_IKEAProducts    */#strict on#include "~/_scripts/frameworks/Extendables/extendables.jsx"#include "IKEAProducts.jsx"IKEA.Article = function(document){    var doc = document;        var build_error = function(ErrorType, message){        var res = new ErrorType();        res.message = message;        return res;    };        var getTextFrame = function(sel){        if (sel.is(TextFrame)){            return sel;        }        else if (sel.is(InsertionPoint) || sel.has_own('parentTextFrames')){            return sel.parentTextFrames[0];        }                    throw build_error(ValidationError, "El objeto no contiene texto.");    };    var getInsertionPoint = function(sel, position){        if (sel.is(InsertionPoint)){            return sel;        }        else if (sel.has_own('insertionPoints')){            return sel.insertionPoints[position || 0];        }                    throw build_error(ValidationError, "El objeto no contiene texto.");    };    var insertTextWithXML = function(dst, text, label){        var ip = getInsertionPoint(dst);        ip.contents = text;        var xmlElement = new XMLElement;        xmlElement.markupTag = label;        // readonly ip.associatedXMLElements.push(xmlElement);                return ip.parentTextFrames[0].insertionPoints[ip.index + text.length];    };    return {        insertInto: function(dst, product, partNumber, location){            if (!product && partNumber) {                product = new IKEA.IKEAProduct(partNumber, location || IKEA.TENERIFE);            }            var ip = insertTextWithXML(dst, product.get('name'), 'P1_Nombre');                     insertTextWithXML(ip, product.get('facts'), 'P1_Facts');                     insertTextWithXML(ip, product.get('priceNormal'), 'P1_Price');                 }    };};//~ change_tag (app.activeDocument, 'ART_PRICE', '0.0');//~ function change_tag (doc, myTag, new_value)//~    {//~    for (var i = 0; i < doc.xmlElements.length; i++)//~       {//~       if (doc.xmlElements[i].markupTag.name == myTag)//~          doc.xmlElements[i].contents = new_value;//~       else//~          change_tag (doc.xmlElements[i], myTag, new_value);//~       }//~    }function main(){    try {        var Product = new IKEA.IKEAProduct("802.456.40", IKEA.TENERIFE);        IKEA.addXMLElement(null, "A_802.456.40", Product.defaultFields());            }    catch(e) {         $.writeln(e.message);        alert(e.message);     }}main();