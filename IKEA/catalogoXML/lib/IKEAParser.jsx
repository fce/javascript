﻿/** IKEA Catalogo XML    Author: Javier Ramos    ==== Parser Module ====    */#strict on// Extends IKEA module with a submodule for styling capabilitiesIKEA.Parser = (function() {    var self = this;        var exported = { name:'IKEA submodule: Parser' };        exported.parseArticle = function(article) {        """Extracts information from article using heuristic"""        var example = """01 MULIG estantería rd$2,295 Se puede utilizar en baños y otras zonas con humedad del interior. Acero lacado y plástico. 22⅞x13⅜”, altura 63¾”. Blanco 002.410.47  02 IVAR 2 secciones con estantes y armarios RD$13,400 Puedes mover los estantes para adaptar el espacio a tus necesidades. Pino macizo. 68½x11¾”, altura 70½” 098.963.77 CAZW  03 GORM estantería RD$2,995 Puedes mover los estantes para adaptar el espacio a tus necesidades. Pino y abeto macizo. 30¾x21⅝”, altura 68½” 000.585.19 XFAE  04 HYLLIS estantería RD$849 Acero galvanizado. 23⅝x10⅝”, altura 55⅛” 002.785.78 UDE""";            };    return exported;})();