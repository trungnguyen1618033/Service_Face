import flask 
from flask import Flask, request, render_template, jsonify
from util import base64_to_pil, np_to_base64
import uuid
import numpy as np
import os
import json

from face_recognition import *

    
def convert_to_json(labels, bboxes):
    faces = bboxes.tolist()
    # print(faces, type(faces))
    print(labels, type(labels))
    dict_json = {'labels': labels, 'bboxes': faces }
    jsonobj = json.dumps(dict_json)
    return jsonobj


# recognition = FaceRecognition()

app = Flask(__name__)

@app.route("/")
@app.route("/index")
def index():
    return render_template('index.html')


@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        # Get the image from post request
        img = base64_to_pil(request.json)
        np_img = np.array(img)
        link_path = './uploads'
        path = os.listdir(link_path)
        name = 'image_' + str(len(path)) + '.jpe'
        file_path = os.path.join(link_path, name)
        img.save(file_path)

        labels, bboxes = recognition.GetLabel(file_path)
        jsonobj = convert_to_json(labels, bboxes)
  
        return jsonobj
    return None


# @app.route('/listCebel', methods=['GET'])
# def index():
    
#     return None


if __name__ == "__main__":
    app.run()
     

