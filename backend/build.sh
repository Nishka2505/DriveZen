#!/bin/bash
pip install --upgrade pip
pip install --only-binary :all: numpy==1.26.4
pip install --only-binary :all: scikit-learn==1.4.2
pip install --only-binary :all: pandas==2.2.2
pip install flask==3.0.0 flask-cors==4.0.0 joblib==1.3.2 gunicorn==21.2.0
pip install --only-binary :all: opencv-python-headless==4.9.0.80