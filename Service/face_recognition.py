import pickle
import numpy as np
import csv
import argparse
from  ArcfaceRetina import FacialRecognition
import os
import cv2
import faiss
from matplotlib import pyplot as plt
from skimage import io
import random
from util import base64_to_pil, np_to_base64


def read_data_train(path):
  f = open(path, "rb")
  dict_ = pickle.load(f)
  X = []
  Y = []
  db_img_paths = []
  for x in dict_:
      _class = (x['class'])
      Y.append(_class)
      X.append(np.array(x['features']))
      db_img_paths.append(x['imgfile'])
  X = np.array(X)
  Y = np.array(Y)
  f.close()
  return X, Y, db_img_paths

class FaceRecognition():
    def __init__(self, arcface_model= "./model/model-r100-ii/model,0", retina_detector="./model/R50", gpu_index= 0):

        self.model = FacialRecognition(arcface_model=arcface_model, retina_model=retina_detector
                                  , gpu_index=gpu_index)
        self.train_embedding_file = 'embedding-model'
        self.threshold = 1.2

        self.X_train, self.Y_train, self.db_path = read_data_train(self.train_embedding_file)
        self.d = 512
        self.search_model = faiss.IndexFlatL2(self.d)
        self.search_model.add(self.X_train)

    def predict_2(self, img):
        k = 15
        features, bboxes = self.model.detect_face_and_get_embedding_test_2(img)
        list_label = []
        # print(bboxes)
        if features is None:
            return None
        for feature in features:
            D, I = self.search_model.search(np.array([feature]), k)
            predictions = []
            for k in range(len(I[0])):
                la = self.Y_train[I[0][k]]
                dis = D[0][k]
                if dis > self.threshold and 'unknow' not in predictions:
                    predictions.append('unknow')
                predictions.append(la)
            if predictions is not None:
                list_label.append(predictions[0])
        return list_label, bboxes

    def predict(self, img):
        features, bboxes = model.detect_face_and_get_embedding_test_2(img)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        #   GET PREDICTIONS
        k = 15
        predicts = []
        bboxes_results = []
        if features is None:
            return None
        if features is not None:
            for i, feature in enumerate(features):
                D, I = search_model.sreach(np.array([feature]), k)
                predictions = []
                la = Y_train[I[0][0]]
                dis = D[0][0]
                if dis > threshold:
                    predictions.append('unknow')
                predictions.append(la)
                if len(predictions) != 0:
                    predicts.append(predictions[0])
                    bboxes_results.append(bboxes[i])
            return predicts

    def GetLabel(self, image):
        img = cv2.imread(image)
        labels, faces = self.predict_2(img)
        font = cv2.FONT_HERSHEY_SIMPLEX 
        dict_color = []
        if labels is None:
            print('None')
        # if labels is not None:
        #     for la in labels:
        #         print(la)
        if faces is not None:
              # print('faces', faces, type(faces))
              bboxes = np.asarray(faces, dtype=np.int)
            #   print('bboxes', bboxes, type(bboxes))
            #   for j,i  in enumerate(bboxes):
            #       box = np.array(i)
            #       # print('box', box)
            #     #   r = random.randint(0,255)
            #     #   g = random.randint(0,255)
            #     #   b = random.randint(0,255)
            #     #   rgb = [r,g,b]
            #     #   print(j)
            #     #   print(labels[j])
            #       # print('color:', rgb)
            #     #   dict_color.append(rgb)
            #       cv2.rectangle(img, (box[0], box[1]), (box[2], box[3]), (255,0,0), 2)
        # link_path = './output'
        # path = os.listdir(link_path)
        # name = 'image_' + str(len(path)) + '.jpg'
        # filename = os.path.join(link_path, name)

        # cv2.imwrite(filename, img)
        # img = cv2.imread(filename)
        # img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        # image_data = np.array(img)
    

        # image_base64 = np_to_base64(image_data)
        return labels, bboxes

              