/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var popup=false;
var dataBase = {
	conn:null,
	initialize: function() {
		try {
			if (!window.openDatabase) {
				throw 0;//alert('您的浏览器不支持数据库存储，请换一个浏览器试试~');
			} else {
				var shortName = 'DrDB';
				var version = '1.0';
				var displayName = 'Dehelfer Database';
				var maxSize = 100000; //  bytes
				this.conn = openDatabase(shortName, version, displayName, maxSize);
			} 
		}
		catch(e) {
			if (e == 2) {
				console.log("数据库版本错误！");
			} else {
				console.log("未知错误: "+e+".");
			}
			return;
		}
	},
	createDictTable: function() {
		this.conn.transaction(
			function (transaction) {
				transaction.executeSql(
					'CREATE TABLE IF NOT EXISTS Dict(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);'
				);
        	}
   		);
	},
	addDict: function(dictName) {
		this.conn.transaction(
			function (transaction) {
				transaction.executeSql(
					'INSERT INTO Dict(id INTEGER, name TEXT) VALUES(NULL,?);',
					[dictName]
				);
				this.createWordTable(dictName);
        	}
   		);
	},
	createWordTable: function(tableName) {
		this.conn.transaction(
			function (transaction) {
				transaction.executeSql(
					'CREATE TABLE IF NOT EXISTS '+tableName+'(id INTEGER PRIMARY KEY AUTOINCREMENT, context TEXT,meaning TEXT, unitId INTEGER, cnt INTEGER, wait INTEGER, correct INTEGER);'
				);
        	}
   		);
	},
	addWord: function(tableName,data) {
		this.conn.transaction(
            function (transaction) {
				transaction.executeSql(
					'INSERT INTO '+tableName+'(id, context, meaning, unitId, cnt, wait,correct) VALUES (NULL, ?, ?, ?, 0, 0, 0);', [data["Content"], data["Meaning"], data["UnitId"]]
				);
			}
		);
	}
};
var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
	  	document.addEventListener('deviceready', app.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
  	onDeviceReady: function() {
		//navigator.splashscreen.hide();	
		/*	
		var html = '<div data-role="collapsible" data-inset="false" data-collapsed="false">';
		html += '<h4>platform</h4>';
		html += '<ul data-role="listview">';
		html += '<li><a href="#page2" data-transition="slide">' + device.platform + ' ' + device.version + '</a></li>';
		html += '<li>' + device.model + '</li>';
		html += '</ul></div>';
		
		$('#dev')[0].innerHTML = html;		
		$('[data-role=collapsible]').collapsible().trigger('create');		
		// 这句激活所有 collapsible 标签的按钮，如果没有的话，添加的内容只会以原始的 ul/li 的方式呈现。
		*/
		//app.creatPopup();
		document.addEventListener('backbutton', app.onBackKeyDown, true);
  	},
	showMyAlert: function(txt) {
        $.mobile.loadingMessageTextVisible = true;
        //$.mobile.showPageLoadingMsg("a", text, true);
		$.mobile.loading('show', {
			theme: "a",
			text: txt,
			textonly: true,
			textVisible: true
		});
    },
    
    //弹出提示框信息的方法，两秒后隐藏
    myAlert: function(text) {
        this.showMyAlert(text);
        setTimeout(this.hideLoading, 2000);
    },
    
    //隐藏提示框的方法
    hideLoading: function() {
        //$.mobile.hidePageLoadingMsg();
		$.mobile.loading('hide');
    },        
    //退出app
    exitApp: function() {
        navigator.app.exitApp();
    },
	onConfirm: function(button) {
		if(button==1) this.exitApp(); //选择了确定才执行退出
	},
	creatPopup: function() {
		var popupDialogId = 'popupDialog';
		$('<div data-role="popup" id="' + popupDialogId + '" data-confirmed="no" data-transition="none" data-dismissible="false" style="min-width:216px;max-width:500px;background:#454545;"> \
						\
						<div role="main" class="ui-content">\
							<h5 class="ui-title" style="color:#eee; text-align:center;margin-bottom:15px;text-shadow: none;">确实要关闭应用吗？</h3>\
							<a href="#" class="ui-btn ui-corner-all ui-btn-inline ui-btn-b optionConfirm" data-rel="back" style="background: #1d80c3;width: 33%;border-radius: 5px;height: 30px;line-height: 30px;padding: 0;font-size: .7em;margin: 0 0 0 12%;font-weight: bold;text-shadow: none;">确定</a>\
							<a href="#" class="ui-btn ui-corner-all ui-btn-inline ui-btn-b optionCancel" data-rel="back" data-transition="flow" style="background: #DBDBDB;width: 33%;border-radius: 5px;height: 30px;line-height: 30px;padding: 0;font-size: .7em;margin: 0 0 0 5%;font-weight: bold;color: #333;text-shadow: none;">取消</a>\
						</div>\
					</div>')
			.appendTo($.mobile.pageContainer);
		var popupDialogObj = $('#' + popupDialogId);
		popupDialogObj.trigger('create');
		popupDialogObj.popup({
			afterclose: function (event, ui) {
				popupDialogObj.find(".optionConfirm").first().off('click');
				var isConfirmed = popupDialogObj.attr('data-confirmed') === 'yes' ? true : false;
				$(event.target).remove();
				//popupDialogObj.popup('close');
				if (isConfirmed) {
					app.exitApp();
				}else{
					popup=false;
				}
				
			}
		});  
		$("#popupDialog").popup('open');
		$("#popupDialog").find(".optionConfirm").first().on('click', function () {
					popupDialogObj.attr('data-confirmed', 'yes');
		});	
		popup=true;
	},
	onBackKeyDown: function() {	
		navigator.vibrate(70);
		if(popup==false){
			var activePageId = $.mobile.activePage.attr("id");
			if (activePageId == 'indexPage'){
				//alert("hello");
				app.creatPopup();
			}else{
				navigator.app.backHistory();
			}  
		}else{
			$("#popupDialog").popup('close');
			$("#popupDialog").remove();
			popup=false;
		}
		
	}
};
