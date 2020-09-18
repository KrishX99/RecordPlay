const electron = require('electron');
const fs = require('fs');
var file_saver = require("file-saver");
const record = require('./record');
const play = require('./playback');
const bc = new BroadcastChannel('test_channel');
bc.onmessage = function (ev) { 
	//console.log(">>>>>>>>>>> ",ev.data); 
	//console.log("----",document.querySelector('#url').value)
	var row_data = ev.data ;
	var row_element = `<tr> 
						<td class="counterCell"> </td>
						<td>${row_data.event}</td>
						<td>${row_data.xpath}</td>
						<td>${(row_data.value) ? row_data.value : '' }</td>
					  </tr>`;

	if(ev.data.duplicate){
		/*Replace text for same input element*/
			var table = document.getElementById("recordTable");
			var lastRowIndex = table.rows.length-1;
			var lastCellIndex = table.rows[lastRowIndex].cells.length-1;
			table.rows[lastRowIndex].cells[lastCellIndex].innerHTML = row_data.value;
	}else{
		document.querySelector("tbody").insertAdjacentHTML('beforeend',row_element);	
	}				  	
}

/*Call Playing Feature*/
function playing(){

	console.log("play========>>>>")
	alert(document.querySelector('#url').value);

	play("play");
	
}

/*Call recording Feature*/
function recording(){
	console.log("record========>>>>")
	if(document.querySelector('#rec').style.display === 'block'){
		if(!document.querySelector('#url').value){
			alert("Enter Valid URL");
			return "Enter Valid URL";
		}
		record(document.querySelector('#url').value);
		document.querySelector('#rec').style.display = 'none';
		document.querySelector('#stop').style.display = 'block';
		/*Clear table data*/
	 	var table = document.querySelector("tbody");
		table.innerHTML = "";

	}else{
		document.querySelector('#rec').style.display = 'block';
		document.querySelector('#stop').style.display = 'none';
		//record("close");
	}	
}

/*To open pre recorded data file*/
document.getElementById('inputfile').addEventListener('change', function(evt) { 
    var fr = new FileReader(); 
    var json;
    fr.onload=(function(theFile){ 
    	return function (e) {
    		try {
				json = JSON.parse(e.target.result);
				/*Input URL in input element*/
				document.querySelector("#url").value = json.data[0].xpath;
				/*Populate table data in table*/
				var table = document.querySelector("tbody");
				table.innerHTML = "";
				var table_element ="";
				Array.prototype.forEach.call(json.data, item => {
				  var row_element = `<tr> 
						<td class="counterCell"> </td>
						<td>${item.event}</td>
						<td>${item.xpath}</td>
						<td>${(item.value) ? item.value : '' }</td>
					  </tr>`;

					table_element = table_element + row_element;	  
				});
				document.querySelector("tbody").insertAdjacentHTML('beforeend',table_element);
				/*Call function to copy selected file in to data.json*/
				copyData(json);
			} catch (ex) {
				//alert('ex when trying to parse json = ' + ex);
				alert("Unknown file was received");
				return "Unknown file was received";
			}
    	}
    } )();
      
    fr.readAsText(evt.target.files[0]); 
})

/*Function to copy selected file in to data.json*/

function copyData(json){
	//alert( JSON.stringify(json));
	fs.writeFile('data.json', JSON.stringify(json), function(err) {
	  if(err) throw err;
	  console.log('done');
	});
}

/*Function to save recorded data in file*/

function saveRecordedData(){
	let file = fs.readFileSync('data.json');
	let parse_file = JSON.parse(file);
	if( parse_file.data.length === 0){
		alert("You are saving without record. First record data.");
		return "You are saving without record. First record data.";
	}
    var blob = new Blob([JSON.stringify(parse_file)], {type: "text/plain;charset=utf-8"});
    file_saver.saveAs(blob, "data.json");
}

/*Create New Data to Record*/
function openViewForurl(){
	var modal = document.getElementById("urlModal");
	document.getElementById("addUrl").value = "";
	modal.style.display = "block";
}

/*To confirm URL*/
function confirmUrl(){
	var addUrl = document.getElementById("addUrl").value;
	/*if(!addUrl || addUrl===""){
		alert("Enter valid URL");
		return "Enter valid URL";
	}*/
	document.querySelector("#url").value = addUrl;
	var modal = document.getElementById("urlModal");
	modal.style.display = "none";
	/*Create data file*/
    let json = {data:[]};
 	fs.writeFile('data.json', JSON.stringify(json), 'utf8', function(err,value){ });
 	/*Clear table data*/
 	var table = document.querySelector("tbody");
	table.innerHTML = "";
	/*Reset selected file*/
	const file = document.querySelector('#inputfile');
  	file.value = '';
}

/*To cancel URL*/
function cancelUrl(){
	var modal = document.getElementById("urlModal");
	modal.style.display = "none";
}

/*To Register Event for Slider*/
function closeSlider(e){
	let attr = document.querySelector('#rangeinput');
	//console.log(e.target.title);
	if(e.target.title !== "Test excution speed" && e.target.title !== "slider"){
		attr.className = "slider_none";
	}
}
document.body.addEventListener('click', closeSlider, true);

/*To Open Slider*/
function toggleSlider(){
	let attr = document.querySelector('#rangeinput');
	attr.className = (attr.className === "slider_none")?"slider_block" : "slider_none";
	
}

/*On Change execution time from slider*/
function changeExecutionTime(){
	let attr = document.querySelector("#rangeinput");
	console.log(attr.value)
	let data = {'slowMod': parseInt(attr.value)};
	fs.writeFile('constant.json', JSON.stringify(data), 'utf8', function(err,value){ });
}

/*Create constant file*/
(function InitiateConstant(){
	let data = {'slowMod': 50};
	fs.writeFile('constant.json', JSON.stringify(data), 'utf8', function(err,value){ });
})();
