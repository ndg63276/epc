const apikey = get_text("apikey.txt");
const auth = typeof(apikey) == "string" ? btoa(apikey.deobfuscate()) : btoa("INSERT EMAIL ADDRESS AND API KEY HERE");

const fields = {
"address": "Address",
"inspection-date": "Date of Inspection",
"current-energy-rating": "Current Energy Rating",
"potential-energy-rating": "Potential Energy Rating",
"current-energy-efficiency": "Current Energy Efficiency",
"potential-energy-efficiency": "Potential Energy Efficiency",
"co2-emissions-current": "Current CO&#8322; Emissions (tonnes/year)",
"co2-emissions-potential": "Potential CO&#8322; Emissions (tonnes/year)",
"energy-consumption-current": "Current Energy Consumption (kWh/m&sup2;)",
"energy-consumption-potential": "Potential Energy Consumption (kWh/m&sup2;)",
"walls-description": "Walls",
"floor-description": "Floors",
"windows-description": "Windows",
"roof-description": "Roof",
"hotwater-description": "Hot Water",
"mainheat-description": "Heating",
"mainheatcont-description": "Heating Controls",
"lighting-description": "Lighting",
"solar-water-heating-flag": "Solar Water Heating",
"photo-supply": "Solar Panels",
}
/*
"glazed-type": "Window Glazing",
"environment-impact-current": "Current Environmental Impact",
"environment-impact-potential": "Potential Environment Impact",
"low-energy-fixed-light-count": "",
"floor-height": "",
"heating-cost-potential": "",
"unheated-corridor-length": "",
"hot-water-cost-potential": "",
"construction-age-band": "",
"mainheat-energy-eff": "",
"windows-env-eff": "",
"lighting-energy-eff": "",
"heating-cost-current": "",
"address3": "",
"sheating-energy-eff": "",
"property-type": "",
"local-authority-label": "",
"fixed-lighting-outlets-count": "",
"energy-tariff": "",
"mechanical-ventilation": "",
"hot-water-cost-current": "",
"county": "",
"postcode": "",
"constituency": "",
"number-heated-rooms": "",
"local-authority": "",
"built-form": "",
"number-open-fireplaces": "",
"glazed-area": "",
"mains-gas-flag": "",
"co2-emiss-curr-per-floor-area": "",
"address1": "",
"heat-loss-corridor": "",
"flat-storey-count": "",
"constituency-label": "",
"roof-energy-eff": "",
"total-floor-area": "",
"building-reference-number": "",
"floor-energy-eff": "",
"number-habitable-rooms": "",
"address2": "",
"hot-water-env-eff": "",
"posttown": "",
"mainheatc-energy-eff": "",
"main-fuel": "",
"lighting-env-eff": "",
"windows-energy-eff": "",
"floor-env-eff": "",
"sheating-env-eff": "",
"roof-env-eff": "",
"walls-energy-eff": "",
"lighting-cost-potential": "",
"mainheat-env-eff": "",
"multi-glaze-proportion": "",
"main-heating-controls": "",
"lodgement-datetime": "",
"flat-top-storey": "",
"secondheat-description": "",
"walls-env-eff": "",
"transaction-type": "",
"lighting-cost-current": "",
"lodgement-date": "",
"extension-count": "",
"mainheatc-env-eff": "",
"lmk-key": "",
"wind-turbine-count": "",
"tenure": "",
"floor-level": "",
"hot-water-energy-eff": "",
"low-energy-lighting": "",
}
*/

window.onhashchange = function() {
	console.log(location.hash);
	if (location.hash.length == 0) {
		console.log("blank");
		clearAll();
	} else if ( ! isNaN(parseInt(location.hash.substring(1))) ) {
		console.log("number");
		showDetails(location.hash.substring(1));
	} else {
		console.log("postcode");
		back();
	}
}

function sortByKey(key, array) {
	return array.sort(function(a, b) {
		var x = a[key].toLowerCase(); var y = b[key].toLowerCase();
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}

function search() {
	var postcode = document.getElementById("postcode").value.replace(" ", "");
	var url = "https://epc.opendatacommunities.org/api/v1/domestic/search";
	var headers = {
		"Accept": "application/json",
		"Authorization": "Basic "+auth
	}
	var data = {
		"postcode": postcode,
		"size": 1000,
	}
	$.ajax({
		url: url,
		type: "GET",
		headers: headers,
		data: data,
		async: false,
		success: function (json) {
			location.hash = postcode;
			generateDetails(postcode, json);
		},
		error: function (jqXHR, exception) {
			var results = document.getElementById("results");
			results.innerHTML = "No results found";
		}
	})
}

function getDetails(lmkkey) {
	var url = "https://epc.opendatacommunities.org/api/v1/domestic/certificate/"+lmkkey;
	var headers = {
		"Accept": "application/json",
		"Authorization": "Basic "+auth
	}
	$.ajax({
		url: url,
		type: "GET",
		headers: headers,
		async: false,
		success: function (json) {
			postcode = json["rows"][0]["postcode"].replace(" ", "");
			generateDetails(postcode, json)
		},
		error: function (jqXHR, exception) {
			var results = document.getElementById("results");
			results.innerHTML = "No results found";
		}
	})
}


function generateDetails(postcode, json) {
	var results = document.getElementById("results");
	results.innerHTML = "";
	var sorted = sortByKey("address", json["rows"]);
	for (key in sorted) {
		var thiskey = sorted[key];
		var div = document.createElement("div");
		div.classList.add("addressDiv");
		var a = document.createElement("a");
		a.innerHTML = thiskey["address"];
		a.href = "#"+thiskey["lmk-key"];
		a.id = thiskey["lmk-key"];
		var span = document.createElement("span");
		span.innerHTML = " (" + thiskey["inspection-date"].substr(0,4) + ")";
		var safeAddress = thiskey["address"].replace(/[ ,]/g, "").toLowerCase();
		span.classList.add("hidden", safeAddress);
		div.append(a, span);
		var table = document.createElement("table");
		table.classList.add("fixed-table");
		table.id = "id_" + thiskey["lmk-key"];
		var current = thiskey["current-energy-rating"];
		var potential = thiskey["potential-energy-rating"];
		for (field in fields) {
			if (field in thiskey) {
				var tr = document.createElement("tr");
				var td1 = document.createElement("td");
				td1.classList.add("leftcolumn");
				td1.innerHTML = fields[field]+":";
				var td2 = document.createElement("td");
				if (field.startsWith("current")) {
					td2.innerHTML = "<span class='triangle triangle_"+current+"'></span>";
					td2.innerHTML += "<span class='rating rating_"+current+"'>"+thiskey[field]+"</span>";
				} else if (field.startsWith("potential")) {
					td2.innerHTML = "<span class='triangle triangle_"+potential+"'></span>";
					td2.innerHTML += "<span class='rating rating_"+potential+"'>"+thiskey[field]+"</span>";
				} else {
					td2.innerHTML = "<span class='leftpadding'>"+thiskey[field]+"</span>";
				}
				tr.append(td1, td2);
				table.append(tr);
			}
		}
		tr = document.createElement("tr");
		td1 = document.createElement("td");
		td1.classList.add("center");
		td1.innerHTML = "<a href='#"+postcode+"'>Back</a>";
		td1.colSpan = "3";
		tr.append(td1);
		table.append(tr);
		table.classList.add("hidden", "addressTable");
		results.append(div, table);
		if (document.getElementsByClassName(safeAddress).length > 1) {
			for (el of document.getElementsByClassName(safeAddress)) {
				el.classList.remove("hidden");
			}
		}
	}

}

function showDetails(thisid) {
	for (div of document.getElementsByClassName("addressDiv")) {
		div.classList.add("hidden");
	}
	document.getElementById("searchForm").classList.add("hidden");
	var el = document.getElementById("id_"+thisid);
	el.classList.remove("hidden");
	window.scroll(0, 0);
}

function back() {
	if (document.getElementById("results").dataset.refresh == "true") {
		location.reload();
		return
	};
	for (div of document.getElementsByClassName("addressDiv")) {
		div.classList.remove("hidden");
	}
	for (div of document.getElementsByClassName("addressTable")) {
		div.classList.add("hidden");
	}
	document.getElementById("searchForm").classList.remove("hidden");
}

function clearAll() {
	for (div of document.getElementsByClassName("addressDiv")) {
		div.classList.add("hidden");
	}
	for (div of document.getElementsByClassName("addressTable")) {
		div.classList.add("hidden");
	}
	document.getElementById("searchForm").classList.remove("hidden");
}

$(document).ready(function () {
	var hash = location.hash.substring(1)
	if (hash == 0) {
		console.log("blank");
		clearAll();
	} else if ( ! isNaN(parseInt(hash)) ) {
		console.log("number");
		document.getElementById("results").dataset.refresh = "true";
		getDetails(hash);
		showDetails(hash);
	} else {
		console.log("postcode");
		document.getElementById("postcode").value = hash;
		search();
	}
});
