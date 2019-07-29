#!/usr/bin/python
from watson_developer_cloud import VisualRecognitionV3
import json
import sys
import cgi

# Receive data from JS
fs = cgi.FieldStorage()

for k in fs.keys():
    picName = fs.getvalue(k)

# Pathname
path = 'images/'+picName
print('Content-type: text/html\r\n\r')

visual_recognition = VisualRecognitionV3(
    version='2018-03-19',
    iam_apikey='2bD2GP8g-R5-GHxF-_ze1oclTBYtI0O5-zjtWvS2fGuB'
)

with open(path, 'rb') as images_file:
    classes = visual_recognition.classify(
        images_file,
        threshold='0.6',
        classifier_ids='DefaultCustomModel_2059640191').get_result()
print(json.dumps(classes, indent=2))
