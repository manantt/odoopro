// ==UserScript==
// @name         Odoo Pro
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Some Odoo utilities
// @author       Manantt
// @match        https://cosmomedia-serdata.odoo.com/*
// @grant        none
// ==/UserScript==

/************************************** CONFIGURACIÓN **********************************************
 * 
 * Poner esta sentencia en la consola del navegador desde la web de Odoo indicando tu id de empleado
 * localStorage.setItem('id_empleado_odoo', 999);
 * El id de empleado se puede encontrar en la url de tu perfil de Odoo
 */

var id_empleado = localStorage.getItem("id_empleado_odoo");
var payload = '{"jsonrpc":"2.0","method":"call","params":{"model":"hr.attendance","domain":[["employee_id","=",'+id_empleado+'],["employee_id","=",'+id_empleado+']],"fields":["check_in","check_out"],"limit":80,"sort":"","context":{"lang":"es_ES","tz":"Europe/Madrid","uid":51,"active_model":"hr.employee","active_id":'+id_empleado+',"active_ids":[794],"search_default_employee_id":'+id_empleado+',"default_employee_id":'+id_empleado+',"search_disable_custom_filters":true}},"id":546348831}';
var horas = 0;
var minutos = 0;
var segundos = 0;

recalcularTiempos();
(function() {
    setTimeout(function(){
        $(".o_hr_attendance_kiosk_mode").click(function(){
            setTimeout(function(){
                recalcularTiempos();
            }, 2000);
        });
    }, 2000);
})();

function recalcularTiempos(){
    console.error("asdf");
    $.ajax({
        url: 'https://cosmomedia-serdata.odoo.com/web/dataset/search_read',
        type: "POST",
        dataType: "json",
        data: payload,
        contentType: "application/json",
        success: function(data){
            var seg = 0;
            var trabajando = false;
            $.each(data.result.records, function(key, value) {
                var entrada = new Date(value.check_in);
                var salida = null;
                if(value.check_out) {
                    salida = new Date(value.check_out);
                } else {
                    trabajando = true;
                    salida = new Date();
                    salida.setHours(salida.getHours() - 1);
                }
                if(esHoy(entrada)) {
                    var diffSegundos = (salida - entrada) / 1000;
                    seg += diffSegundos;
                }
            });
            parseHoras(seg);
            document.title = "Odoo - " + horas + "h " + minutos + "m " + segundos + "s";
            setInterval(function(){
                if(trabajando){
                    segundos++;
                    if(segundos >= 60) {
                        minutos++;
                        segundos -= 60;
                    }
                    if(minutos >= 60) {
                        horas++;
                        minutos -= 60;
                    }
                }
                document.title = "Odoo - " + horas + "h " + minutos + "m " + segundos + "s";
            }, 1000);
        }
    });
}

function parseHoras(seg) {
    horas = parseInt(seg / 3600);
    seg -= horas * 3600;
    minutos = parseInt(seg / 60);
    seg -= minutos * 60;
    segundos = parseInt(seg);
    return horas + "h " + minutos + "m " + segundos + "s";
}

const esHoy = (fecha) => {
    const hoy = new Date()
    return fecha.getDate() == hoy.getDate() &&
      fecha.getMonth() == hoy.getMonth() &&
      fecha.getFullYear() == hoy.getFullYear();
}

// (function() {
//     setTimeout(function(){
//         init();
//     }, 2000);
// })();

// function init() {
//     var menuSuperior = $(".o_menu_systray");
//     var html = `
//         <li class="o_mail_systray_item o_no_notification">
//             <a aria-expanded="false" class="dropdown-toggle o-no-caret" data-display="static" data-toggle="dropdown" href="#" role="button" title="Odoo Pro">
//                 <i aria-label="Odoo Pro" class="fa fa-terminal" role="img"></i> <span class="o_notification_counter badge badge-pill">0</span>
//             </a>
//             <div class="o_mail_systray_dropdown dropdown-menu dropdown-menu-right" role="menu">
//                 <div class="o_mail_systray_dropdown_items">
//                     <div class="dropdown-item-text text-center o_no_activity">
//                         <span>Sin actividades planificadas.</span>
//                     </div>
//                 </div>
//             </div>
//         </li>
//     `;
//     menuSuperior.prepend(html.replace(/\n/g, ""));
// }