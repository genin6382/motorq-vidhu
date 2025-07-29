from flask import Flask
from flask_cors import CORS
import os 
from models import db,Vehicles,Telemetry


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Vidhulinux@localhost:3306/motorq'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 

app.secret_key = os.urandom(24)

db.init_app(app)

with app.app_context():
    db.create_all()


@app.route('/hello', methods=['GET'])
def hello_world():
    return 'Hello, World!'


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)