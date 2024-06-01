frappe.provide("frappe.sensor_data");
frappe.sensor_data.jscUrl = 'https://code.jscharting.com/latest/jscharting.js'

frappe.pages["dht22"].on_page_load = function (wrapper) {
	// Load JsCharting main script
	var jscMain = document.createElement('script');
	jscMain.src = 'https://code.jscharting.com/latest/jscharting.js';
	jscMain.onload = function() {
		loadJsChartingWidgets();
	};
	document.head.appendChild(jscMain);

	function loadJsChartingWidgets() {
		// Load JsCharting widgets script
		var jscWidgets = document.createElement('script');
		jscWidgets.src = 'https://code.jscharting.com/latest/jscharting-widgets.js';
		jscWidgets.onload = function() {
			console.log('JsCharting and widgets loaded successfully.');

			var chartpage = frappe.sensor_data.sensor_items;
			
			chartpage.setup(wrapper);
			chartpage.addfilters();
			// $(wrapper).bind("show", () => {
				
			// })
		};
		document.head.appendChild(jscWidgets);
	}
};

frappe.sensor_data.sensor_items = {
	setup : function (wrapper, filters) {
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: "DHT22",
			single_column: true,
		});
		this.wrapper = $(wrapper);
		this.main_section = this.wrapper.find(".layout-main-section");
		// this.page.set_title("Sensor Data Charts");
		this.page.clear_fields();
		frappe.breadcrumbs.add("dht22");
		this.main_section.append(`<div id="sensor-charts"></div>`);

		let start_date = new Date()
		let now_date = new Date()
		let diff = now_date.getTimezoneOffset();

		//get start date and time
		start_date.setHours(0,0,0,0)
		var numberOfMlSecondsStart = start_date.getTime();
		var addMlSecondsStart = diff * 60 * 1000;
		var newStartDateObj = new Date(numberOfMlSecondsStart - addMlSecondsStart);
		start_date_and_time = newStartDateObj.toJSON()

		//get end date and time
		var numberOfMlSecondsEnd = now_date.getTime();
		var addMlSecondsEnd = diff * 60 * 1000;
		var newEndDateObj = new Date(numberOfMlSecondsEnd - addMlSecondsEnd);
		end_date_and_time = newEndDateObj.toJSON()

		let current_user = frappe.session.user

		// get doc by filters

		frappe
			.call(
				"dht22.dht22.doctype.humidity_and_temperature.humidity_and_temperature.get_dht22_data",
				{
				start_time: start_date_and_time,
				end_time: end_date_and_time
				}
			)
			.then((data) => {
				console.log(data.message[1])
				$("#sensor-charts").html(data.message[0]);
				updateCharts(data.message[1])
				
			});
	},

	addfilters : function () {
		var sensorchartpage = this;
		this.fields = {};
		this.fields.start_time = this.page.add_field({
			label: "Start Date and Time",
			fieldname: "start",
			fieldtype: "Datetime",
			default: new Date().toJSON(),
			change() {
			// sensorchartpage.refresh(false);
			frappe
			.call(
				"dht22.dht22.doctype.humidity_and_temperature.humidity_and_temperature.get_dht22_data",
				{
					start_time: this.value,
					end_time: sensorchartpage.fields.end_time.value
				}
			)
			.then((data) => {
				// console.log(data.message[1])
				$("#sensor-charts").html(data.message[0]);
				updateCharts(data.message[1])
				});
			
			},
			
		});

		this.fields.end_time = this.page.add_field({
			label: "End Date and Time",
			fieldname: "end",
			fieldtype: "Datetime",
			default: "Now",
			change() {
			// sensorchartpage.refresh(false);
			frappe
			.call(
				"dht22.dht22.doctype.humidity_and_temperature.humidity_and_temperature.get_dht22_data",
				{
					start_time: sensorchartpage.fields.start_time.value,
					end_time: this.value
				}
			)
			.then((data) => {
				$("#sensor-charts").html(data.message[0]);
				updateCharts(data.message[1])
				});
			
			},
			
		});
	},

	refresh : function(){
		
	}
}


function updateCharts(sensor_data){
	// Update the gauges or charts using the new data
	// getFlowChartData(sensor_data.flow_data)
}


//***********************************************Flow Chart*********************************************************************
function getFlowChartData(aggregatedData){	

		// Sort the aggregated data based on submission_datetime in ascending order
		aggregatedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

		// Group the data by name1
		var groupedData = {};

		aggregatedData.forEach(item => {
			const meter_serial = item.meter_name;
			if (!groupedData[meter_serial]) {
				groupedData[meter_serial] = [];
			}
			groupedData[meter_serial].push(item);
		});
		
		// console.log(aggregatedData)
		// Create separate series for each group
		var series = [];
		Object.keys(groupedData).forEach(meter_serial => {
			var group = groupedData[meter_serial];
			var points = group.map(item => {
				return {
				x: item.submission_datetime,
				y: item.consumption
				};
			});
			series.push({
				name: 'Flow In Meters',
				line_width: 1,
				color: "#0f69b6",
				defaultPoint_marker_visible: true, 
				defaultPoint_marker: { size: 3 },
				name: meter_serial,
				points: points
			});
		});
	
		// Create a Flow chart
		var chartFlow = JSC.chart('chartDivFlow', {
		type: 'spline',
		title_label: { 
			text: 'Water Consumption In m³', 
			style_fontSize: 15 
		},
		legend: { 
			template: '%icon %name', 
			position: 'inside top left'
		},
		yAxis: {
			formatString: 'd'
		},
		xAxis: {
			customTicks: [
			{
				value: {
				day: "*"
				},
				label_text: "%min"
			},
			{
				value: {
				month: "*"
				},
				label_text: "%min"
			}
			],
			scale: { 
			type: 'time',
			interval: {
				unit: 'hour'
			}
			}
		}, 
		series: series,
		toolbar_visible: false
	});
}
