// ==UserScript==
// @name         Odoo Pro
// @namespace    http://tampermonkey.net/
// @version      0.5
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

function autoSetIdEmpleado() {
	if(window.location.href == "https://cosmomedia-serdata.odoo.com/web#action=566&menu_id=393") {
		idEmpleado = $("img.img.rounded-circle").attr("src").replace("/web/image?model=hr.employee&field=image_medium&id=", "");;
		localStorage.setItem('id_empleado_odoo', idEmpleado);
	}
}

function semana(){
	var hoy = new Date();
	var semanaPasada = new Date;
    semanaPasada = new Date(semanaPasada.setDate(semanaPasada.getDate() - 7));

	var inicioSemana = getInicioSemana(hoy); //"2020-03-01 22:00:00";
	var finSemana = getFinSemana(hoy); //"2020-03-08 22:00:00";
	var payloadSemana = '{"jsonrpc":"2.0","method":"call","params":{"args":[],"model":"hr.attendance","method":"read_group","kwargs":{"context":{"lang":"es_ES","tz":"Europe/Madrid","uid":51,"active_model":"hr.employee","active_id":794,"active_ids":[794],"search_default_employee_id":794,"default_employee_id":794,"search_disable_custom_filters":true,"group_by":"check_in"},"domain":[["employee_id","=",794],["employee_id","=",794],"&",["check_in",">=","'+inicioSemana+'"],["check_in","<","'+finSemana+'"]],"fields":["x_studio_nombre_empresa","x_studio_nif_empresa","x_studio_field_Vq3gL","employee_id","check_in","check_out","worked_hours"],"groupby":["check_in:week"],"orderby":"","lazy":true}},"id":591586260}';
	$.ajax({
        url: 'https://cosmomedia-serdata.odoo.com/web/dataset/call_kw/hr.attendance/read_group',
        type: "POST",
        dataType: "json",
        data: payloadSemana,
        contentType: "application/json",
        success: function(data){
            $("#semana").html(toHM(data.result[0].worked_hours));
        }
    });

    var inicioSemanaPasada = getInicioSemana(semanaPasada);
	var finSemanaPasada = getFinSemana(semanaPasada);
    var payloadSemanaPasada = '{"jsonrpc":"2.0","method":"call","params":{"args":[],"model":"hr.attendance","method":"read_group","kwargs":{"context":{"lang":"es_ES","tz":"Europe/Madrid","uid":51,"active_id":794,"active_ids":[794],"params":{"action":778,"active_id":794,"model":"hr.attendance","view_type":"list","menu_id":377},"search_default_employee_id":794,"default_employee_id":794,"search_disable_custom_filters":true,"group_by":"check_in"},"domain":[["employee_id","=",794],["employee_id","=",794],"&",["check_in",">=","'+inicioSemanaPasada+'"],["check_in","<","'+finSemanaPasada+'"]],"fields":["x_studio_nombre_empresa","x_studio_nif_empresa","x_studio_field_Vq3gL","employee_id","check_in","check_out","worked_hours"],"groupby":["check_in:week"],"orderby":"","lazy":true}},"id":6608434}';
	$.ajax({
        url: 'https://cosmomedia-serdata.odoo.com/web/dataset/call_kw/hr.attendance/read_group',
        type: "POST",
        dataType: "json",
        data: payloadSemanaPasada,
        contentType: "application/json",
        success: function(data){
            $("#semanaPasada").html(toHM(data.result[0].worked_hours));
        }
    });
}

function getInicioSemana(fecha) {
	var day = fecha.getDay();
    var diff = fecha.getDate() - day + (day == 0 ? -6 : 1);
  	fecha.setDate(diff);
  	return (fecha.getYear() + 1900) + "-" + ("0" + (fecha.getMonth() + 1)).slice(-2) + "-" + ("0" + fecha.getDate()).slice(-2) + " 00:00:00";
}

function getFinSemana(fecha) {
	var day = fecha.getDay();
    var diff = fecha.getDate() - day + 7;
  	fecha.setDate(diff);
  	return (fecha.getYear() + 1900) + "-" + ("0" + (fecha.getMonth() + 1)).slice(-2) + "-" + ("0" + fecha.getDate()).slice(-2) + " 00:00:00";
}

function toHM(horas) {
	var tiempo = "";
	var horasEnteras = parseInt(horas);
	var minutos = parseInt((horas - horasEnteras) * 60);
	return horasEnteras + "h " + minutos + "m";
}

function recalcularTiempos(){
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

(function() {
    setTimeout(function(){
        init();
    }, 2000);
})();

function init() {
    var menuSuperior = $(".o_menu_systray");
    var html = `
        <li class="o_mail_systray_item o_no_notification">
            <a aria-expanded="false" class="dropdown-toggle o-no-caret" data-display="static" data-toggle="dropdown" href="#" role="button" title="Odoo Pro">
                <span id="pro" style="font-weight: bold;top: -2px;position:relative;color: rgb(250, 100, 50);">Pro</span> <span class="o_notification_counter badge badge-pill">0</span>
            </a>
            <div class="o_mail_systray_dropdown dropdown-menu dropdown-menu-right" role="menu">
                <div class="o_mail_systray_dropdown_items">
                    <div class="dropdown-item-text">
                        <table style="width: 100%;margin:10px;">
                        	<tr>
                        		<td><b>Trabajado semana pasada:</b></td>
                        		<td id="semanaPasada"></td>
                        	</tr>
                        	<tr>
                        		<td><b>Trabajado esta semana</b></td>
                        		<td id="semana"></td>
                        	</tr>
                        </table>
                    </div>
                </div>
            </div>
        </li>
    `;
    menuSuperior.prepend(html.replace(/\n/g, ""));
    semana();
    var interval = setInterval(function(){
    	if(!localStorage.getItem('id_empleado_odoo')) {
    		autoSetIdEmpleado();
    	} else {
    		$("#pro").css("color", "rgb(100, 255, 100);");
    		clearInterval(interval);
    	}
    }, 3000);
}