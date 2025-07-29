from flask_sqlalchemy import SQLAlchemy
import uuid
from datetime import datetime

db = SQLAlchemy()

class Vehicles(db.Model):
    __tablename__= "Vehicles"

    id = db.Column(db.Integer, primary_key=True)
    vin = db.Column(db.String(36), primary_key=True)
    manufacturer = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    fleet_id = db.Column(db.String(50), nullable=False) 
    owner_info = db.Column(db.Text) 
    registration_status = db.Column(db.String(20), default='Active') 
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "vin": self.vin,
            "manufacturer": self.manufacturer,
            "model": self.model,
            "fleet_id": self.fleet_id,
            "owner_info": self.owner_info,
            "registration_status": self.registration_status,
            "timestamp": self.timestamp.isoformat()
        }



class Telemetry(db.Model):
    __tablename__="Telemetry"
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('Vehicles.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    speed_kmh = db.Column(db.Float)
    engine_status = db.Column(db.String(10)) 
    fuel_level = db.Column(db.Float) 
    odometer_reading = db.Column(db.Float,default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

