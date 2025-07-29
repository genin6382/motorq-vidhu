from flask import Flask,request
from flask_cors import CORS
import os 
from models import db,Vehicles,Telemetry
import random

#for calling the function every thirty seconds
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

scheduler=BackgroundScheduler()


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Vidhulinux@localhost:3306/motorq'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 

app.secret_key = os.urandom(24)

db.init_app(app)

with app.app_context():
    db.create_all()


#Vehicles

#Route to create a vehicle and list all vehicles
@app.route('/vehicles',methods=["GET","POST"])
def create_vehicle():
    return 

#Route to query A vehicle
@app.route('/vehicles/<string:vin>',methods=["GET"])
def query_vehicle():
    return 

#Route to delete a vehicle
@app.route("/vehicles/<string:vin>",methods=["DELETE"])
def delete_vehicle():
    return 


#Telemetry

#Returns latest telemetry data for all vehicles
@app.route("/telemetry/data",methods=["GET"])
def list_telemetry():
    return

#Returns latest telemetry data for specific data
@app.route('/telemetry/data/<int:vehicle_id>',methods=["GET"])
def query_telemetry():
    return

#Return history of telemetry history for a particular vehicle
@app.route('/telemetry/data/<int:vehicle_id>',methods=["GET"])
def query_telemetry_history():
    return


#Generate synthetic data every 30 seconds
def generate_data():
    vehicle_ids = db.session.query(Vehicles.vehicle_id).all()
    print(vehicle_ids)

    for i in vehicle_ids:
        latitude = random.uniform(-90.0, 90.0)
        longitude = random.uniform(-180.0, 180.0)
        speed = random.uniform(0.0,200.0)
        fuel_level = random.uniform(0.0,100.0)

        if speed and fuel_level:
            engine_status = "ON"
        elif not speed and not fuel_level:
            engine_status = "OFF"
        else :
            engine_status = "IDLE"

        odometer_reading= Vehicles.query.filter_by(vehicle_id=id).order_by(Vehicles.timestamp.desc()).odometer_reading

        if engine_status=="ON":
            if speed < 10 :
                odometer_reading+=0.2
            else : 
                odometer_reading +=0.5
        new_record = Vehicles(vehicle_id=id, latitude=latitude, longitude=longitude ,speed= speed,fuel_level=fuel_level,engine_status=engine_status,odometer_reading=odometer_reading )
        db.session.add(new_record)
        db.session.commit()


scheduler.add_job(generate_data, 'interval', seconds=30)

scheduler.start()

atexit.register(lambda: scheduler.shutdown())


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)