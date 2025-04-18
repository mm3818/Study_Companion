import patch_werkzeug

from flask import Flask, jsonify, request, send_from_directory, g
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
import tempfile
import subprocess
import platform
from functools import wraps
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///study_materials.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Migration: add missing columns if they don't exist ---
with db.engine.connect() as conn:
    # Check if 'approved' column exists in 'material'
    cols = conn.execute("PRAGMA table_info('material')").fetchall()
    col_names = [c[1] for c in cols]
    if 'approved' not in col_names:
        conn.execute("ALTER TABLE material ADD COLUMN approved BOOLEAN DEFAULT 1")
    if 'uploaded_by' not in col_names:
        conn.execute("ALTER TABLE material ADD COLUMN uploaded_by INTEGER")

# Models
table_args = {'sqlite_autoincrement': True}
class User(db.Model):
    __tablename__ = 'user'
    __table_args__ = (table_args,)
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin' or 'user'

class Material(db.Model):
    __tablename__ = 'material'
    __table_args__ = (table_args,)
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    attachment = db.Column(db.String(200), nullable=True)
    approved = db.Column(db.Boolean, nullable=False, default=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

class Favorite(db.Model):
    __tablename__ = 'favorite'
    __table_args__ = (table_args,)
    id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey('material.id'), nullable=False)

# Create any new tables
with app.app_context():
    db.create_all()

# Authentication stub and role enforcement
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not getattr(g, 'user', None) or g.user.role != 'admin':
            return jsonify({'message': 'Admins only!'}), 403
        return f(*args, **kwargs)
    return decorated

@app.before_request
def load_user():
    # Dummy login: ensure an admin user exists and set g.user
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', role='admin')
        db.session.add(admin)
        # also create a default regular user if none
        db.session.commit()
    g.user = admin

# Configure file uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Simple antivirus scan (dummy keyword check)
def antivirus_scan(file_stream):
    content = file_stream.read()
    file_stream.seek(0)
    if b"malware" in content.lower() or b"virus" in content.lower():
        return False, {"message": "File is flagged as suspicious."}
    return True, {"message": "File passed preliminary scan."}

# Utility: notify admin (placeholder)
def notify_admin(material_id, filename):
    print(f"[Notification] Material {{material_id}} pending approval: {{filename}}")

# Routes
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return jsonify(message="Welcome to the Study Companion Backend!")

@app.route('/materials', methods=['GET'])
def get_materials():
    subject = request.args.get('subject')
    search = request.args.get('search')
    query = Material.query.filter_by(approved=True)
    if subject:
        query = query.filter(Material.subject.ilike(f"%{subject}%"))
    if search:
        query = query.filter(
            Material.title.ilike(f"%{search}%") | Material.content.ilike(f"%{search}%")
        )
    materials = query.all()
    return jsonify([{
        'id': m.id,
        'subject': m.subject,
        'title': m.title,
        'content': m.content,
        'attachment': f"/uploads/{m.attachment}" if m.attachment else None
    } for m in materials])

@app.route('/materials', methods=['POST'])
def add_material():
    subject = request.form.get('subject')
    title = request.form.get('title')
    content = request.form.get('content')
    if not subject or not title or not content:
        return jsonify(message="Missing data"), 400

    filename = None
    if 'attachment' in request.files:
        file = request.files['attachment']
        if file and allowed_file(file.filename):
            success, msg = antivirus_scan(file)
            if not success:
                return jsonify(msg), 400
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        else:
            return jsonify(message="File extension not allowed"), 400

    material = Material(
        subject=subject,
        title=title,
        content=content,
        attachment=filename,
        approved=False,
        uploaded_by=g.user.id
    )
    db.session.add(material)
    db.session.commit()
    notify_admin(material.id, filename or "no-file")
    return jsonify(message="Material submitted for approval", id=material.id), 201

@app.route('/subjects', methods=['GET'])
def get_subjects():
    subs = db.session.query(Material.subject).filter_by(approved=True).distinct().all()
    return jsonify([s[0] for s in subs])

@app.route('/admin/notifications', methods=['GET'])
@admin_required
def admin_notifications():
    pending = Material.query.filter_by(approved=False).all()
    return jsonify([{
        'id': m.id,
        'subject': m.subject,
        'title': m.title,
        'content': m.content,
        'attachment': f"/uploads/{m.attachment}" if m.attachment else None,
        'uploaded_by': m.uploaded_by
    } for m in pending])

@app.route('/admin/approve/<int:mid>', methods=['POST'])
@admin_required
def approve_material(mid):
    m = Material.query.get_or_404(mid)
    m.approved = True
    db.session.commit()
    return jsonify(message="Material approved")

@app.route('/admin/reject/<int:mid>', methods=['DELETE'])
@admin_required
def reject_material(mid):
    m = Material.query.get_or_404(mid)
    if m.attachment:
        path = os.path.join(app.config['UPLOAD_FOLDER'], m.attachment)
        if os.path.exists(path): os.remove(path)
    db.session.delete(m)
    db.session.commit()
    return jsonify(message="Material rejected and deleted")

@app.route('/favorites', methods=['POST'])
def add_favorite():
    data = request.get_json() or {}
    mid = data.get('material_id')
    if not mid:
        return jsonify(message="Material ID required"), 400
    fav = Favorite(material_id=mid)
    db.session.add(fav)
    db.session.commit()
    return jsonify(message="Favorite added"), 201

@app.route('/favorites', methods=['GET'])
def get_favorites():
    favs = Favorite.query.all()
    out = []
    for f in favs:
        m = Material.query.get(f.material_id)
        if m and m.approved:
            out.append({
                'id': m.id,
                'subject': m.subject,
                'title': m.title,
                'content': m.content,
                'attachment': f"/uploads/{m.attachment}" if m.attachment else None
            })
    return jsonify(out)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
