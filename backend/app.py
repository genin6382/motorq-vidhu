from flask import Flask,request,jsonify
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
    if request.method=="GET":
        try:
            vehicles_data = Vehicles.query.all()
            data= {
                "status_code":200,
                "vehicles_data":vehicles_data.to_dict()
            }
            return jsonify(data)
        except Exception as e:
            print("Error:",e)
            return {
                "status_code":500,
                "message":"Error occurred"
            }     
    elif request.method=="POST":
        try:
            data = request.json()
            vin = data.get("vin")
            manufacturer = data.get("manufacturer")
            model = data.get("model")
            fleet_id = data.get("fleet_id")
            owner_info = data.get("owner_info")
            registration_status = data.get("registration_status", 'Active')

            if not vin or not manufacturer or not model or not fleet_id or not owner_info or not registration_status:
                return jsonify({
                    "status_code": 400,
                    "message": "Missing fields"
                }), 400

            vehicle_exists = Vehicles.query.filter_by(vin=vin).first()
            if vehicle_exists:
                return jsonify({
                    "status_code": 409,
                    "message": "Vehicle already exists."
                }), 409

            new_vehicle = Vehicles(
                manufacturer=manufacturer,
                model=model,
                fleet_id=fleet_id,
                owner_info=owner_info,
                registration_status=registration_status
            )
            db.session.add(new_vehicle)
            db.session.commit()

            return jsonify({
                "status_code": 201,
                "message": "New Vehicle created ",
                "vehicle_data":new_vehicle
            }), 201
        
        except Exception as e:
            print("Error:",e)
            return jsonify({
                "status_code": 500,
                "message": "Error occurred"
            }), 500
        


@app.route('/vehicles/<string:vin>',methods=["GET"])
def query_vehicle(vin):
    try:
        vehicle = Vehicles.query.filter_by(vin=vin).first()
        if vehicle:
            return jsonify({
                "status_code": 200,
                "vehicle_data": vehicle.to_dict()
            }), 200
        
    except Exception as e:
        return jsonify({
            "status_code": 500,
            "message":"An error occurred"
        }), 500

#Route to delete a vehicle
@app.route("/vehicles/<string:vin>",methods=["DELETE"])
def delete_vehicle(vin):
    try:
        vehicle = Vehicles.query.filter_by(vin=vin).first()
        if vehicle:
            db.session.delete(vehicle)
            db.session.commit()
            return jsonify({
                "status_code": 200,
                "message": "Vehicle deleted successfully."
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status_code": 500,
            "message": f"An error occurred: {str(e)}"
        }), 500

#Telemetry

#Returns latest telemetry data for all vehicles
@app.route("/telemetry/data",methods=["GET"])
def list_telemetry():
    try:
        telemetry_data=Telemetry.query.all()
        data={
            "status_code":200,
            "telemetry_data":telemetry_data
        }
        return jsonify(data)
    except Exception as e :
        print("Error:",e)
        return {
            "status_code":500,
            "message":"Error occurred"
        }    


#Returns latest telemetry data for specific data
@app.route('/telemetry/data/<int:vehicle_id>',methods=["GET"])
def query_telemetry(vehicle_id):
    try:

        vehicle = Telemetry.query.filter_by(vehicle_id=vehicle_id).first()
        if vehicle:
            return jsonify({
                "status_code": 200,
                "vehicle_data": vehicle.to_dict()
            }), 200
        
    except Exception as e:
        return jsonify({
            "status_code": 500,
            "message":"An error occurred"
        }), 500

#Return history of telemetry history for a particular vehicle
@app.route('/telemetry/data/<int:vehicle_id>',methods=["GET"])
def query_telemetry_history(vehicle_id):
    try:
        vehicle = Telemetry.query.filter_by(vehicle_id=vehicle_id).first()
        if vehicle:
            return jsonify({
                "status_code": 200,
                "vehicle_data": vehicle.to_dict()
            }), 200
        
    except Exception as e:
        return jsonify({
            "status_code": 500,
            "message":"An error occurred"
        }), 500
    return


#Generate synthetic data every 30 seconds
def generate_data():
    vehicle_ids = db.session.query(Vehicles.id).all()
    print(vehicle_ids)

    for i in vehicle_ids:
        latitude = random.uniform(-90.0, 90.0)
        longitude = random.uniform(-180.0, 180.0)
        speed = random.uniform(0.0,200.0)
        fuel_level = random.uniform(0.0,100.0)

        if speed > 0:
            engine_status = "ON"
        elif speed== 0 and fuel_level > 0:
            engine_status = "IDLE"
        else:
            engine_status = "OFF"
      
        latest_telemetry_reading= Telemetry.query.filter_by(vehicle_id=id).order_by(Telemetry.timestamp.desc())
        if latest_telemetry_reading:
            odometer_reading=latest_telemetry_reading.odometer_reading
        else:
            odometer_reading = 0.0

        if engine_status=="ON":
            if speed < 10 :
                odometer_reading+=0.2
            else : 
                odometer_reading +=0.5
        new_record = Telemetry(vehicle_id=id, latitude=latitude, longitude=longitude ,speed= speed,fuel_level=fuel_level,engine_status=engine_status,odometer_reading=odometer_reading )
        db.session.add(new_record)
        db.session.commit()


scheduler.add_job(generate_data, 'interval', seconds=30)

scheduler.start()

atexit.register(lambda: scheduler.shutdown())


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)