# Copyright (c) 2024, Kariuki and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import datetime

class HumidityandTemperature(Document):
	pass

@frappe.whitelist()
def get_dht22_data(start_time, end_time):
    print("*"*80)
    print(start_time, end_time)
    # try:
    #     start_datetime = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S.%fZ")
    # except:
    #     start_datetime = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
        
    dht22_dict = {}
    dht_docs = frappe.db.get_all("Humidity and Temperature", filters={"timestamp":['between', (start_time, end_time)]}, fields=["timestamp", "humidity", "temperature"])
    
    if dht_docs:
        print(dht_docs)

        dht22_dict["data"] = dht_docs
        
        render = frappe.render_template("dht22/page/templates/dht22.html", dht22_dict)

        return render, dht22_dict