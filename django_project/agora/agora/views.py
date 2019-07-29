
from django.http import JsonResponse
import json
import urllib.request as urllib2
from watson_developer_cloud import VisualRecognitionV3

visual_recognition = VisualRecognitionV3(
    '2018-03-19',
    iam_apikey='2bD2GP8g-R5-GHxF-_ze1oclTBYtI0O5-zjtWvS2fGuB')


def agora(request):
    target_url = request.GET["url"]
    
    import shutil
    import urllib.request
    import requests
    from six import BytesIO
    from PIL import Image

    urllib.request.urlretrieve(target_url, 'test.png')
    with open('test.png', 'rb') as images_file:
        classes = visual_recognition.classify(
            images_file,
            threshold='0.6',
        classifier_ids='DefaultCustomModel_2059640191').get_result()
        print(classes)
    # with open(data, 'rb') as images_file:
    #     classes = visual_recognition.classify(
    #         images_file,
    #         threshold='0.6',
    #     classifier_ids='DefaultCustomModel_2059640191').get_result()
    # print(json.dumps(classes, indent=2))

    return JsonResponse(classes)