from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify(message="Welcome to the Study Companion Backend!")

@app.route('/capstone')
def capstone():
    # Example endpoint that could provide dynamic data
    return jsonify(message="This data comes from the Flask backend's /capstone endpoint.")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
