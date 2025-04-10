import patch_werkzeug

from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import tempfile
import subprocess
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///study_materials.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure file uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def antivirus_scan(file_stream):
    """
    Save the uploaded file to a temporary location,
    scan it using clamscan, and return True if the file is clean.
    """
    print("Scanning for viruses...")  # Message indicating the scan has started

    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        file_path = temp_file.name
        temp_file.write(file_stream.read())
    
    # Reset the file pointer so further processing can use the file if needed
    file_stream.seek(0)

    # Run clamscan on the temporary file
    result = subprocess.run(["clamscan", file_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Remove the temporary file
    os.remove(file_path)
    
    output = result.stdout.decode("utf-8")
    # Check if the scan result contains "OK" (indicating no virus found)
    if "OK" in output:
        print("File is safe.")  # Message indicating the file passed the scan
        return True
    else:
        print("File is not safe.")  # Message indicating the file failed the scan
        return False

# Models
class Material(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    attachment = db.Column(db.String(200), nullable=True)  # Stores the filename

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey('material.id'), nullable=False)

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return jsonify(message="Welcome to the Study Companion Backend with SQLite!")

# Retrieve study materials with optional filtering
@app.route('/materials', methods=['GET'])
def get_materials():
    subject = request.args.get('subject')
    search = request.args.get('search')
    query = Material.query
    if subject:
        query = query.filter(Material.subject.ilike(f"%{subject}%"))
    if search:
        query = query.filter(
            Material.title.ilike(f"%{search}%") | Material.content.ilike(f"%{search}%")
        )
    materials = query.all()
    result = []
    for m in materials:
        result.append({
            'id': m.id, 
            'subject': m.subject, 
            'title': m.title, 
            'content': m.content,
            'attachment': f"http://localhost:5000/uploads/{m.attachment}" if m.attachment else None
        })
    return jsonify(result)

# Add a new study material, accepting file uploads with antivirus scanning
@app.route('/materials', methods=['POST'])
def add_material():
    # Text fields are passed in request.form, and file is in request.files
    subject = request.form.get('subject')
    title = request.form.get('title')
    content = request.form.get('content')
    if not subject or not title or not content:
        return jsonify(message="Missing data"), 400

    attachment_filename = None
    if 'attachment' in request.files:
        file = request.files['attachment']
        if file and allowed_file(file.filename):
            # Perform antivirus scan before saving the file
            if not antivirus_scan(file):
                return jsonify(message="File failed antivirus scan"), 400
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            attachment_filename = filename
        else:
            return jsonify(message="File extension not allowed"), 400

    new_material = Material(
        subject=subject,
        title=title,
        content=content,
        attachment=attachment_filename
    )
    db.session.add(new_material)
    db.session.commit()
    return jsonify(message="Material added successfully", id=new_material.id), 201

# Retrieve distinct subjects
@app.route('/subjects', methods=['GET'])
def get_subjects():
    subjects = db.session.query(Material.subject).distinct().all()
    subjects_list = [s[0] for s in subjects]
    return jsonify(subjects_list)

# Add a material to favorites
@app.route('/favorites', methods=['POST'])
def add_favorite():
    data = request.get_json()
    material_id = data.get('material_id')
    if not material_id:
        return jsonify(message="Material ID required"), 400
    favorite = Favorite(material_id=material_id)
    db.session.add(favorite)
    db.session.commit()
    return jsonify(message="Favorite added successfully", id=favorite.id), 201

# Retrieve favorites
@app.route('/favorites', methods=['GET'])
def get_favorites():
    favorites = Favorite.query.all()
    result = []
    for fav in favorites:
        material = Material.query.get(fav.material_id)
        if material:
            result.append({
                'id': material.id,
                'subject': material.subject,
                'title': material.title,
                'content': material.content,
                'attachment': f"http://localhost:5000/uploads/{material.attachment}" if material.attachment else None
            })
    return jsonify(result)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
